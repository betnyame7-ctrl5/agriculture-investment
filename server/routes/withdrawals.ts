import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { 
  requireAuth, 
  requireAdmin, 
  AuthenticatedRequest, 
  createNotification, 
  recordLedgerTransaction 
} from '../utils.js';

const router = Router();

// User: Get personal withdrawal history & limits
router.get('/my', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const settings = db.prepare('SELECT min_withdrawal FROM site_settings WHERE id = ?').get('default') as any;
    const withdrawals = db.prepare(`
      SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user!.id);

    res.status(200).json({
      minWithdrawal: settings?.min_withdrawal || 10.0,
      withdrawals
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve withdrawals.' });
  }
});

// User: Submit withdrawal request
router.post('/submit', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { amount, network, mobile_number, account_holder_name } = req.body;
    const userId = req.user!.id;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'Please enter a valid withdrawal amount.' });
      return;
    }

    const settings = db.prepare('SELECT min_withdrawal FROM site_settings WHERE id = ?').get('default') as any;
    const minWithdrawal = settings ? settings.min_withdrawal : 10.0;

    if (parsedAmount < minWithdrawal) {
      res.status(400).json({ error: `Minimum withdrawal amount is GH₵${minWithdrawal.toFixed(2)}.` });
      return;
    }

    if (!network || !['TELECEL', 'MTN'].includes(network.toUpperCase())) {
      res.status(400).json({ error: 'Please select a valid Mobile Money network (TELECEL or MTN).' });
      return;
    }

    if (!mobile_number || mobile_number.trim().length < 9) {
      res.status(400).json({ error: 'Please provide a valid Mobile Money phone number.' });
      return;
    }

    if (!account_holder_name || account_holder_name.trim().length < 3) {
      res.status(400).json({ error: 'Please enter the registered Mobile Money account holder name.' });
      return;
    }

    const user = db.prepare('SELECT id, balance, full_name FROM profiles WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    // Validate against user's actual available balance
    if (user.balance < parsedAmount) {
      res.status(400).json({ 
        error: `Insufficient available balance. You requested GH₵${parsedAmount.toFixed(2)}, but your current balance is GH₵${user.balance.toFixed(2)}.`,
        availableBalance: user.balance
      });
      return;
    }

    const withdrawalId = 'wth_' + crypto.randomUUID();
    const now = new Date().toISOString();
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore - parsedAmount;

    // Secure atomic operation: hold funds and create request
    const withdrawTx = db.transaction(() => {
      // 1. Deduct funds from user available balance into escrow
      db.prepare('UPDATE profiles SET balance = balance - ?, updated_at = ? WHERE id = ?')
        .run(parsedAmount, now, userId);

      // 2. Create pending withdrawal record
      db.prepare(`
        INSERT INTO withdrawals (
          id, user_id, amount, network, mobile_number, account_holder_name,
          status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run(
        withdrawalId,
        userId,
        parsedAmount,
        network.toUpperCase(),
        mobile_number.trim(),
        account_holder_name.trim(),
        now
      );

      // 3. Record in transactions ledger
      recordLedgerTransaction(
        userId,
        'withdrawal_payout',
        parsedAmount,
        balanceBefore,
        balanceAfter,
        withdrawalId,
        `Withdrawal requested to ${network.toUpperCase()} (${mobile_number.trim()} - ${account_holder_name.trim()}). Pending admin payout.`
      );

      // 4. Send user notification
      createNotification(
        userId,
        'Withdrawal Request Placed',
        `Your withdrawal request of GH₵${parsedAmount.toFixed(2)} to ${network.toUpperCase()} (${mobile_number.trim()}) is pending administrator approval.`,
        'withdrawal'
      );

      // 5. Alert admin
      const admins = db.prepare("SELECT id FROM profiles WHERE role = 'admin'").all() as any[];
      for (const a of admins) {
        createNotification(
          a.id,
          'New Withdrawal Request Needs Approval',
          `User ${user.full_name} submitted a withdrawal of GH₵${parsedAmount.toFixed(2)} to ${network.toUpperCase()} (${mobile_number.trim()}).`,
          'withdrawal'
        );
      }
    });

    withdrawTx();

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully! An administrator will review and process your Mobile Money transfer shortly.',
      withdrawalId,
      newBalance: balanceAfter
    });
  } catch (err: any) {
    console.error('Submit withdrawal error:', err);
    res.status(500).json({ error: 'Failed to process withdrawal request.' });
  }
});

// Admin: Get all withdrawals
router.get('/admin/all', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const status = req.query.status as string;
    let query = `
      SELECT w.*, p.full_name, p.email, p.balance as current_balance
      FROM withdrawals w
      JOIN profiles p ON w.user_id = p.id
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ` WHERE w.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY w.created_at DESC`;

    const withdrawals = db.prepare(query).all(...params);
    res.status(200).json({ withdrawals });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve withdrawals.' });
  }
});

// Admin: Approve withdrawal (records actual payment reference)
router.post('/admin/:id/approve', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { payment_reference } = req.body;

    if (!payment_reference || payment_reference.trim().length === 0) {
      res.status(400).json({ error: 'Please enter the actual Mobile Money payment reference ID after sending the funds.' });
      return;
    }

    const withdrawal = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(id) as any;
    if (!withdrawal) {
      res.status(404).json({ error: 'Withdrawal record not found.' });
      return;
    }

    if (withdrawal.status !== 'pending') {
      res.status(400).json({ error: `Cannot approve withdrawal that is already ${withdrawal.status}.` });
      return;
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE withdrawals 
      SET status = 'approved', payment_reference = ?, processed_by = ?, processed_at = ?
      WHERE id = ?
    `).run(payment_reference.trim(), req.user!.id, now, id);

    createNotification(
      withdrawal.user_id,
      'Withdrawal Approved & Sent',
      `Your withdrawal of GH₵${withdrawal.amount.toFixed(2)} to ${withdrawal.network} (${withdrawal.mobile_number}) has been completed. MoMo Transaction Ref: ${payment_reference.trim()}.`,
      'success'
    );

    res.status(200).json({
      success: true,
      message: 'Withdrawal marked as approved and payment reference saved.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to approve withdrawal.' });
  }
});

// Admin: Decline withdrawal (refunds held funds back to user)
router.post('/admin/:id/decline', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { decline_reason } = req.body;

    if (!decline_reason || decline_reason.trim().length === 0) {
      res.status(400).json({ error: 'Please enter a reason for declining this withdrawal.' });
      return;
    }

    const withdrawal = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(id) as any;
    if (!withdrawal) {
      res.status(404).json({ error: 'Withdrawal record not found.' });
      return;
    }

    if (withdrawal.status !== 'pending') {
      res.status(400).json({ error: `Cannot decline withdrawal that is already ${withdrawal.status}.` });
      return;
    }

    const user = db.prepare('SELECT id, balance FROM profiles WHERE id = ?').get(withdrawal.user_id) as any;
    if (!user) {
      res.status(404).json({ error: 'Associated user profile not found.' });
      return;
    }

    const now = new Date().toISOString();
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + withdrawal.amount;

    // Refund transaction
    const declineTx = db.transaction(() => {
      // 1. Refund held funds to user balance
      db.prepare('UPDATE profiles SET balance = balance + ?, updated_at = ? WHERE id = ?')
        .run(withdrawal.amount, now, withdrawal.user_id);

      // 2. Update status
      db.prepare(`
        UPDATE withdrawals 
        SET status = 'declined', decline_reason = ?, processed_by = ?, processed_at = ?
        WHERE id = ?
      `).run(decline_reason.trim(), req.user!.id, now, id);

      // 3. Record in ledger
      recordLedgerTransaction(
        withdrawal.user_id,
        'withdrawal_refund',
        withdrawal.amount,
        balanceBefore,
        balanceAfter,
        id,
        `Withdrawal of GH₵${withdrawal.amount.toFixed(2)} Declined & Refunded. Reason: ${decline_reason.trim()}`
      );

      // 4. Notify user
      createNotification(
        withdrawal.user_id,
        'Withdrawal Request Declined',
        `Your withdrawal request of GH₵${withdrawal.amount.toFixed(2)} was declined. Reason: ${decline_reason.trim()}. The funds have been refunded to your account balance.`,
        'warning'
      );
    });

    declineTx();

    res.status(200).json({
      success: true,
      message: 'Withdrawal declined and funds refunded to user balance.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to decline withdrawal.' });
  }
});

export default router;
