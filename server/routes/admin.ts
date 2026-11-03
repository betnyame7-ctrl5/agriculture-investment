import { Router, Response } from 'express';
import db from '../db.js';
import { requireAdmin, AuthenticatedRequest } from '../utils.js';
import { checkSupabaseStatus } from '../supabase.js';

const router = Router();

// Overall Admin Dashboard Statistics
router.get('/metrics', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM profiles WHERE role != 'admin'").get() as { count: number };
    const confirmedDeposits = db.prepare("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM deposits WHERE status = 'approved'").get() as any;
    const pendingDeposits = db.prepare("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM deposits WHERE status = 'pending'").get() as any;
    const totalInvestments = db.prepare("SELECT COALESCE(SUM(contribution_amount), 0) as total, COUNT(*) as count FROM investments").get() as any;
    const activeInvestments = db.prepare("SELECT COALESCE(SUM(contribution_amount), 0) as total, COUNT(*) as count FROM investments WHERE status = 'active'").get() as any;
    const pendingWithdrawals = db.prepare("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM withdrawals WHERE status = 'pending'").get() as any;
    const completedWithdrawals = db.prepare("SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM withdrawals WHERE status = 'approved'").get() as any;
    const unreadSupport = db.prepare("SELECT COUNT(*) as count FROM support_messages WHERE is_read = 0 AND sender_role = 'user'").get() as { count: number };

    res.status(200).json({
      totalUsers: totalUsers.count,
      totalConfirmedDeposits: confirmedDeposits.total,
      confirmedDepositsCount: confirmedDeposits.count,
      totalPendingDeposits: pendingDeposits.total,
      pendingDepositsCount: pendingDeposits.count,
      totalInvestmentsAmount: totalInvestments.total,
      totalInvestmentsCount: totalInvestments.count,
      activeInvestmentsAmount: activeInvestments.total,
      activeInvestmentsCount: activeInvestments.count,
      pendingWithdrawalsAmount: pendingWithdrawals.total,
      pendingWithdrawalsCount: pendingWithdrawals.count,
      completedWithdrawalsAmount: completedWithdrawals.total,
      completedWithdrawalsCount: completedWithdrawals.count,
      unreadSupportCount: unreadSupport.count
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve admin metrics.' });
  }
});

// User Management: List with search
router.get('/users', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const search = req.query.search as string;
    let query = `
      SELECT 
        p.id, p.full_name, p.email, p.phone, p.role, p.balance,
        p.is_verified, p.is_suspended, p.created_at,
        (SELECT COUNT(*) FROM investments WHERE user_id = p.id) as investments_count,
        (SELECT COALESCE(SUM(amount), 0) FROM deposits WHERE user_id = p.id AND status = 'approved') as total_deposited,
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE user_id = p.id AND status = 'approved') as total_withdrawn
      FROM profiles p
    `;
    const params: any[] = [];

    if (search && search.trim().length > 0) {
      query += ` WHERE p.full_name LIKE ? OR p.email LIKE ? OR p.phone LIKE ?`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY p.created_at DESC`;

    const users = db.prepare(query).all(...params);
    res.status(200).json({ users });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve users list.' });
  }
});

// User Management: Suspend / Reactivate account
router.post('/users/:id/toggle-suspend', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT id, is_suspended, role, full_name FROM profiles WHERE id = ?').get(id) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (user.role === 'admin') {
      res.status(400).json({ error: 'Cannot suspend administrator accounts.' });
      return;
    }

    const newSuspended = user.is_suspended ? 0 : 1;
    db.prepare('UPDATE profiles SET is_suspended = ?, updated_at = ? WHERE id = ?')
      .run(newSuspended, new Date().toISOString(), id);

    res.status(200).json({
      success: true,
      is_suspended: newSuspended,
      message: `User ${user.full_name} has been ${newSuspended ? 'suspended' : 'reactivated'}.`
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user suspension status.' });
  }
});

// Website Settings: Get
router.get('/settings', (req, res): void => {
  try {
    const settings = db.prepare('SELECT * FROM site_settings WHERE id = ?').get('default') as any;
    res.status(200).json({ settings });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve website settings.' });
  }
});

// Website Settings: Update (MoMo details, contact info, minimums)
router.put('/settings', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      momo_network, momo_number, momo_account_name,
      min_deposit, min_withdrawal, contact_email,
      contact_phone, contact_address, business_disclosure
    } = req.body;

    db.prepare(`
      UPDATE site_settings SET
        momo_network = ?, momo_number = ?, momo_account_name = ?,
        min_deposit = ?, min_withdrawal = ?, contact_email = ?,
        contact_phone = ?, contact_address = ?, business_disclosure = ?,
        updated_at = ?
      WHERE id = 'default'
    `).run(
      momo_network || 'TELECEL',
      momo_number || '0507399029',
      momo_account_name || 'JOYCE ASABEA',
      parseFloat(min_deposit) || 10.0,
      parseFloat(min_withdrawal) || 10.0,
      contact_email || 'support@agricultureinvestment.com',
      contact_phone || '+233 50 739 9029',
      contact_address || 'Kumasi, Ghana',
      business_disclosure || '',
      new Date().toISOString()
    );

    res.status(200).json({ success: true, message: 'Website settings updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update website settings.' });
  }
});

// Email Audit Logs (for debugging, verification code lookup, and testing inspection)
router.get('/email-logs', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const logs = db.prepare('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 50').all();
    res.status(200).json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve email logs.' });
  }
});

// Immutable Ledger Transactions
router.get('/transactions', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const transactions = db.prepare(`
      SELECT t.*, p.full_name, p.email 
      FROM transactions t
      JOIN profiles p ON t.user_id = p.id
      ORDER BY t.created_at DESC
      LIMIT 100
    `).all();
    res.status(200).json({ transactions });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
});

// Supabase Status & Test Diagnostics
router.get('/supabase-status', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const status = await checkSupabaseStatus();
    res.status(200).json(status);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to test Supabase status.' });
  }
});

export default router;
