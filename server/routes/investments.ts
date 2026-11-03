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

// Public: Get active packages
router.get('/packages', (req, res): void => {
  try {
    const packages = db.prepare(`
      SELECT * FROM investment_packages WHERE is_active = 1 ORDER BY contribution_amount ASC
    `).all();
    res.status(200).json({ packages });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve livestock packages.' });
  }
});

// Admin: Get all packages (including inactive)
router.get('/admin/packages', requireAdmin, (req, res): void => {
  try {
    const packages = db.prepare(`
      SELECT * FROM investment_packages ORDER BY contribution_amount ASC
    `).all();
    res.status(200).json({ packages });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve livestock packages.' });
  }
});

// Admin: Update package
router.put('/admin/packages/:id', requireAdmin, (req, res): void => {
  try {
    const { id } = req.params;
    const { 
      name, animal_type, contribution_amount, duration_hours,
      projected_return_min, projected_return_max, description,
      business_activity, risk_factors, image_url, is_active 
    } = req.body;

    db.prepare(`
      UPDATE investment_packages SET
        name = ?, animal_type = ?, contribution_amount = ?, duration_hours = ?,
        projected_return_min = ?, projected_return_max = ?, description = ?,
        business_activity = ?, risk_factors = ?, image_url = ?, is_active = ?
      WHERE id = ?
    `).run(
      name, animal_type, parseFloat(contribution_amount), parseInt(duration_hours) || 24,
      parseFloat(projected_return_min), parseFloat(projected_return_max), description,
      business_activity, risk_factors, image_url, is_active ? 1 : 0,
      id
    );

    res.status(200).json({ success: true, message: 'Package updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update package.' });
  }
});

// Admin: Create new package
router.post('/admin/packages', requireAdmin, (req, res): void => {
  try {
    const { 
      name, animal_type, contribution_amount, duration_hours,
      projected_return_min, projected_return_max, description,
      business_activity, risk_factors, image_url 
    } = req.body;

    const id = 'pkg_' + crypto.randomUUID();
    db.prepare(`
      INSERT INTO investment_packages (
        id, name, animal_type, contribution_amount, duration_hours,
        projected_return_min, projected_return_max, description,
        business_activity, risk_factors, image_url, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id, name, animal_type, parseFloat(contribution_amount), parseInt(duration_hours) || 24,
      parseFloat(projected_return_min), parseFloat(projected_return_max), description,
      business_activity, risk_factors, image_url, new Date().toISOString()
    );

    res.status(201).json({ success: true, message: 'New package created successfully.', packageId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create package.' });
  }
});

// User: Invest in livestock package
router.post('/invest', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { package_id } = req.body;
    const userId = req.user!.id;

    if (!package_id) {
      res.status(400).json({ error: 'Livestock package ID is required.' });
      return;
    }

    const pkg = db.prepare('SELECT * FROM investment_packages WHERE id = ? AND is_active = 1').get(package_id) as any;
    if (!pkg) {
      res.status(404).json({ error: 'Selected livestock package is currently unavailable or inactive.' });
      return;
    }

    const user = db.prepare('SELECT id, balance, full_name FROM profiles WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    const contribution = pkg.contribution_amount;

    // Check available balance
    if (user.balance < contribution) {
      res.status(400).json({ 
        error: `Insufficient account balance. You need GH₵${contribution.toFixed(2)}, but your current balance is GH₵${user.balance.toFixed(2)}. Please make a Mobile Money deposit first.`,
        insufficientFunds: true,
        requiredAmount: contribution,
        currentBalance: user.balance
      });
      return;
    }

    // Realistic projected yield within documented range based on agricultural business returns
    const minRet = pkg.projected_return_min;
    const maxRet = pkg.projected_return_max;
    // Calculate randomized realistic yield within genuine margin
    const projectedYield = parseFloat((minRet + Math.random() * (maxRet - minRet)).toFixed(2));

    const durationHours = pkg.duration_hours || 24;
    const startTime = new Date();
    const maturityTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    const investmentId = 'inv_' + crypto.randomUUID();
    const now = startTime.toISOString();
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore - contribution;

    // Execute atomic investment deduction and creation
    const investTx = db.transaction(() => {
      // 1. Deduct balance
      db.prepare('UPDATE profiles SET balance = balance - ?, updated_at = ? WHERE id = ?')
        .run(contribution, now, userId);

      // 2. Insert investment
      db.prepare(`
        INSERT INTO investments (
          id, user_id, package_id, package_name, contribution_amount,
          projected_return, actual_return, duration_hours, start_time,
          maturity_time, status, business_yield_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0.0, ?, ?, ?, 'active', ?, ?)
      `).run(
        investmentId,
        userId,
        pkg.id,
        pkg.name,
        contribution,
        projectedYield,
        durationHours,
        now,
        maturityTime.toISOString(),
        `Active cycle. Dedicated to ${pkg.animal_type} feedlot operations, veterinary management, and certified meat market supply.`,
        now
      );

      // 3. Record in ledger
      recordLedgerTransaction(
        userId,
        'investment_debit',
        contribution,
        balanceBefore,
        balanceAfter,
        investmentId,
        `Investment in ${pkg.name}: GH₵${contribution.toFixed(2)} allocated to 24h livestock cycle.`
      );

      // 4. In-app notification
      createNotification(
        userId,
        `Investment Active: ${pkg.name}`,
        `You have successfully allocated GH₵${contribution.toFixed(2)} into the ${pkg.name}. Cycle runs until ${maturityTime.toLocaleString()}. Projected yield: GH₵${projectedYield.toFixed(2)}.`,
        'investment'
      );
    });

    investTx();

    res.status(201).json({
      success: true,
      message: `Successfully invested GH₵${contribution.toFixed(2)} into ${pkg.name}!`,
      investmentId,
      maturityTime: maturityTime.toISOString(),
      newBalance: balanceAfter
    });
  } catch (err: any) {
    console.error('Investment error:', err);
    res.status(500).json({ error: 'Failed to process investment.' });
  }
});

// User: Get personal investment history
router.get('/history', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const investments = db.prepare(`
      SELECT i.*, p.image_url, p.animal_type
      FROM investments i
      LEFT JOIN investment_packages p ON i.package_id = p.id
      WHERE i.user_id = ?
      ORDER BY i.created_at DESC
    `).all(req.user!.id);

    res.status(200).json({ investments });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve investment history.' });
  }
});

// Admin: Get all investments
router.get('/admin/all', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const status = req.query.status as string;
    let query = `
      SELECT i.*, p.full_name, p.email, pkg.animal_type, pkg.image_url
      FROM investments i
      JOIN profiles p ON i.user_id = p.id
      LEFT JOIN investment_packages pkg ON i.package_id = pkg.id
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ` WHERE i.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY i.created_at DESC`;

    const investments = db.prepare(query).all(...params);
    res.status(200).json({ investments });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve investments list.' });
  }
});

// Admin: Manually trigger harvest cycle payout (for testing or real-time agricultural distribution)
router.post('/admin/:id/complete-cycle', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const inv = db.prepare('SELECT * FROM investments WHERE id = ?').get(id) as any;
    if (!inv) {
      res.status(404).json({ error: 'Investment not found.' });
      return;
    }

    if (inv.status !== 'active') {
      res.status(400).json({ error: `Cannot complete investment that is already ${inv.status}.` });
      return;
    }

    const user = db.prepare('SELECT id, balance, full_name FROM profiles WHERE id = ?').get(inv.user_id) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const contribution = inv.contribution_amount;
    const actualReturn = inv.projected_return;
    const totalPayout = contribution + actualReturn;
    const now = new Date().toISOString();
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + totalPayout;

    const payoutTx = db.transaction(() => {
      db.prepare('UPDATE profiles SET balance = balance + ?, updated_at = ? WHERE id = ?')
        .run(totalPayout, now, inv.user_id);

      db.prepare(`
        UPDATE investments 
        SET status = 'completed', actual_return = ?, completed_at = ?, business_yield_notes = ?
        WHERE id = ?
      `).run(
        actualReturn,
        now,
        `Manual administrative harvest cycle reconciliation. Credited principal GH₵${contribution.toFixed(2)} + documented business yield GH₵${actualReturn.toFixed(2)}.`,
        inv.id
      );

      recordLedgerTransaction(
        inv.user_id,
        'investment_payout',
        totalPayout,
        balanceBefore,
        balanceAfter,
        inv.id,
        `Agricultural Yield Payout: ${inv.package_name}. Principal (GH₵${contribution.toFixed(2)}) + Yield (GH₵${actualReturn.toFixed(2)}).`
      );

      createNotification(
        inv.user_id,
        'Livestock Cycle Matured',
        `Your ${inv.package_name} cycle has been concluded. Total proceeds of GH₵${totalPayout.toFixed(2)} have been credited to your balance.`,
        'investment'
      );
    });

    payoutTx();

    res.status(200).json({
      success: true,
      message: `Investment cycle ${id} marked completed and GH₵${totalPayout.toFixed(2)} credited to user.`
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process cycle completion.' });
  }
});

export default router;
