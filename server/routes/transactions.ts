import { Router, Response } from 'express';
import db from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../utils.js';

const router = Router();

// User: Get personal financial transactions ledger
router.get('/my', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 100
    `).all(req.user!.id);

    res.status(200).json({ transactions });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve transaction ledger.' });
  }
});

export default router;
