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

// Get active deposit payment instructions & user deposit history
router.get('/info', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const settings = db.prepare(`
      SELECT momo_network, momo_number, momo_account_name, min_deposit
      FROM site_settings WHERE id = 'default'
    `).get() as any;

    const myDeposits = db.prepare(`
      SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user!.id);

    res.status(200).json({
      settings: settings || {
        momo_network: 'TELECEL',
        momo_number: '0507399029',
        momo_account_name: 'JOYCE ASABEA',
        min_deposit: 10.0
      },
      deposits: myDeposits
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve deposit information.' });
  }
});

// User submit deposit
router.post('/submit', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { amount, transaction_reference, mobile_number, network, proof_image_url } = req.body;
    const userId = req.user!.id;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'Please enter a valid deposit amount.' });
      return;
    }

    const settings = db.prepare('SELECT min_deposit, momo_network, momo_account_name FROM site_settings WHERE id = ?').get('default') as any;
    const minDeposit = settings ? settings.min_deposit : 10.0;

    if (parsedAmount < minDeposit) {
      res.status(400).json({ error: `Minimum deposit is GH₵${minDeposit.toFixed(2)}.` });
      return;
    }

    if (!transaction_reference || transaction_reference.trim().length === 0) {
      res.status(400).json({ error: 'Please provide the Mobile Money Transaction Reference ID.' });
      return;
    }

    const cleanRef = transaction_reference.trim().toUpperCase();

    // Prevent duplicate transaction references
    const existingRef = db.prepare('SELECT id FROM deposits WHERE UPPER(transaction_reference) = ?').get(cleanRef);
    if (existingRef) {
      res.status(400).json({ error: 'This transaction reference ID has already been submitted in the system. Duplicate submissions are not permitted.' });
      return;
    }

    const depositId = 'dep_' + crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO deposits (
        id, user_id, amount, network, mobile_number, account_name,
        transaction_reference, proof_image_url, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      depositId,
      userId,
      parsedAmount,
      network ? network.trim() : 'TELECEL',
      mobile_number ? mobile_number.trim() : 'N/A',
      settings?.momo_account_name || 'JOYCE ASABEA',
      cleanRef,
      proof_image_url || null,
      now
    );

    // Send in-app notification to user
    createNotification(
      userId,
      'Deposit Request Submitted',
      `Your Mobile Money deposit request of GH₵${parsedAmount.toFixed(2)} (Ref: ${cleanRef}) has been submitted for administrative verification. Please allow 5-15 minutes for confirmation.`,
      'deposit'
    );

    // Notify all admins
    const admins = db.prepare("SELECT id FROM profiles WHERE role = 'admin'").all() as any[];
    for (const a of admins) {
      createNotification(
        a.id,
        'New Pending Deposit Requires Verification',
        `User ${req.user!.full_name} submitted a deposit of GH₵${parsedAmount.toFixed(2)} with reference ${cleanRef}.`,
        'deposit'
      );
    }

    res.status(201).json({
      success: true,
      message: 'Deposit request submitted successfully! Your account balance will be credited as soon as an administrator verifies the Mobile Money payment.',
      depositId
    });
  } catch (err: any) {
    console.error('Submit deposit error:', err);
    res.status(500).json({ error: 'Failed to submit deposit. Please try again.' });
  }
});

// Admin: Get all deposits with filters
router.get('/admin/all', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const status = req.query.status as string;
    let query = `
      SELECT d.*, p.full_name, p.email, p.phone as user_phone, p.balance as current_balance
      FROM deposits d
      JOIN profiles p ON d.user_id = p.id
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ` WHERE d.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY d.created_at DESC`;

    const deposits = db.prepare(query).all(...params);
    res.status(200).json({ deposits });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve deposits list.' });
  }
});

// Admin: Approve deposit
router.post('/admin/:id/approve', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const depositId = req.params.id;
    const { admin_notes } = req.body;

    const deposit = db.prepare('SELECT * FROM deposits WHERE id = ?').get(depositId) as any;
    if (!deposit) {
      res.status(404).json({ error: 'Deposit request not found.' });
      return;
    }

    if (deposit.status !== 'pending') {
      res.status(400).json({ error: `Cannot approve a deposit that is already marked as ${deposit.status}.` });
      return;
    }

    const user = db.prepare('SELECT id, balance, full_name FROM profiles WHERE id = ?').get(deposit.user_id) as any;
    if (!user) {
      res.status(404).json({ error: 'Associated user profile not found.' });
      return;
    }

    const now = new Date().toISOString();
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + deposit.amount;

    // Atomic approval
    const approveTx = db.transaction(() => {
      // 1. Update deposit status
      db.prepare(`
        UPDATE deposits 
        SET status = 'approved', admin_notes = ?, processed_by = ?, processed_at = ?
        WHERE id = ?
      `).run(admin_notes || 'Verified against Mobile Money statement', req.user!.id, now, depositId);

      // 2. Credit user balance
      db.prepare(`
        UPDATE profiles SET balance = balance + ?, updated_at = ? WHERE id = ?
      `).run(deposit.amount, now, deposit.user_id);

      // 3. Record in ledger
      recordLedgerTransaction(
        deposit.user_id,
        'deposit',
        deposit.amount,
        balanceBefore,
        balanceAfter,
        depositId,
        `Mobile Money Deposit Approved. Ref: ${deposit.transaction_reference} via ${deposit.network}.`
      );

      // 4. Send notification
      createNotification(
        deposit.user_id,
        'Deposit Confirmed & Credited',
        `Your Mobile Money deposit of GH₵${deposit.amount.toFixed(2)} (Ref: ${deposit.transaction_reference}) has been verified and added to your available balance.`,
        'success'
      );
    });

    approveTx();

    res.status(200).json({
      success: true,
      message: `Deposit of GH₵${deposit.amount.toFixed(2)} approved and credited to ${user.full_name}.`
    });
  } catch (err: any) {
    console.error('Approve deposit error:', err);
    res.status(500).json({ error: 'Failed to approve deposit.' });
  }
});

// Admin: Decline deposit
router.post('/admin/:id/decline', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const depositId = req.params.id;
    const { decline_reason } = req.body;

    if (!decline_reason || decline_reason.trim().length === 0) {
      res.status(400).json({ error: 'Please enter a reason for declining this deposit.' });
      return;
    }

    const deposit = db.prepare('SELECT * FROM deposits WHERE id = ?').get(depositId) as any;
    if (!deposit) {
      res.status(404).json({ error: 'Deposit request not found.' });
      return;
    }

    if (deposit.status !== 'pending') {
      res.status(400).json({ error: `Cannot decline a deposit that is already marked as ${deposit.status}.` });
      return;
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE deposits 
      SET status = 'declined', admin_notes = ?, processed_by = ?, processed_at = ?
      WHERE id = ?
    `).run(decline_reason.trim(), req.user!.id, now, depositId);

    createNotification(
      deposit.user_id,
      'Deposit Request Declined',
      `Your deposit request for GH₵${deposit.amount.toFixed(2)} (Ref: ${deposit.transaction_reference}) was declined. Reason: ${decline_reason.trim()}. Please verify your transaction reference or contact support.`,
      'warning'
    );

    res.status(200).json({
      success: true,
      message: 'Deposit request marked as declined.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to decline deposit.' });
  }
});

export default router;
