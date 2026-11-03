import { Router, Response } from 'express';
import db from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../utils.js';

const router = Router();

// Get user notifications
router.get('/my', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 100
    `).all(req.user!.id);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `).get(req.user!.id) as { count: number };

    res.status(200).json({
      notifications,
      unreadCount: unreadCount.count
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// Mark single notification as read
router.post('/mark-read/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, req.user!.id);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// Mark all as read
router.post('/mark-all-read', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user!.id);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  }
});

export default router;
