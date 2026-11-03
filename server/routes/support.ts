import { Router, Response } from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { 
  requireAuth, 
  requireAdmin, 
  AuthenticatedRequest, 
  createNotification 
} from '../utils.js';

const router = Router();

// User: Get personal conversation messages
router.get('/my', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const messages = db.prepare(`
      SELECT * FROM support_messages WHERE user_id = ? ORDER BY created_at ASC
    `).all(req.user!.id);

    // Mark admin messages as read by this user
    db.prepare(`
      UPDATE support_messages SET is_read = 1 
      WHERE user_id = ? AND sender_role = 'admin' AND is_read = 0
    `).run(req.user!.id);

    res.status(200).json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve support messages.' });
  }
});

// User: Send support message
router.post('/send', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { message } = req.body;
    const userId = req.user!.id;

    if (!message || message.trim().length === 0) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    const msgId = 'msg_' + crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO support_messages (
        id, user_id, sender_role, sender_name, message, is_read, is_resolved, created_at
      ) VALUES (?, ?, 'user', ?, ?, 0, 0, ?)
    `).run(msgId, userId, req.user!.full_name, message.trim(), now);

    // Notify admins
    const admins = db.prepare("SELECT id FROM profiles WHERE role = 'admin'").all() as any[];
    for (const a of admins) {
      createNotification(
        a.id,
        'New Live Support Message',
        `User ${req.user!.full_name} sent a message: "${message.trim().slice(0, 50)}..."`,
        'support'
      );
    }

    res.status(201).json({
      success: true,
      messageId: msgId,
      createdAt: now
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send support message.' });
  }
});

// Admin: Get all conversations grouped by user
router.get('/admin/threads', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const threads = db.prepare(`
      SELECT 
        p.id as user_id,
        p.full_name,
        p.email,
        p.phone,
        COUNT(CASE WHEN sm.is_read = 0 AND sm.sender_role = 'user' THEN 1 END) as unread_count,
        MAX(sm.created_at) as last_message_time,
        (SELECT message FROM support_messages WHERE user_id = p.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT is_resolved FROM support_messages WHERE user_id = p.id ORDER BY created_at DESC LIMIT 1) as is_resolved
      FROM support_messages sm
      JOIN profiles p ON sm.user_id = p.id
      GROUP BY p.id
      ORDER BY last_message_time DESC
    `).all();

    res.status(200).json({ threads });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve support threads.' });
  }
});

// Admin: Get conversation messages for a specific user
router.get('/admin/thread/:userId', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { userId } = req.params;
    const messages = db.prepare(`
      SELECT * FROM support_messages WHERE user_id = ? ORDER BY created_at ASC
    `).all(userId);

    // Mark user messages as read by admin
    db.prepare(`
      UPDATE support_messages SET is_read = 1 
      WHERE user_id = ? AND sender_role = 'user' AND is_read = 0
    `).run(userId);

    const user = db.prepare('SELECT id, full_name, email, phone, balance, is_verified FROM profiles WHERE id = ?').get(userId);

    res.status(200).json({ messages, user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load conversation thread.' });
  }
});

// Admin: Reply to user message
router.post('/admin/reply', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { user_id, message } = req.body;

    if (!user_id || !message || message.trim().length === 0) {
      res.status(400).json({ error: 'User ID and reply message are required.' });
      return;
    }

    const user = db.prepare('SELECT id, full_name FROM profiles WHERE id = ?').get(user_id) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const msgId = 'msg_' + crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO support_messages (
        id, user_id, sender_role, sender_name, message, is_read, is_resolved, created_at
      ) VALUES (?, ?, 'admin', 'Agro Support Desk', ?, 0, 0, ?)
    `).run(msgId, user_id, message.trim(), now);

    // Create notification for user
    createNotification(
      user_id,
      'Support Team Replied',
      `Our support representative replied: "${message.trim().slice(0, 60)}..."`,
      'support'
    );

    res.status(201).json({
      success: true,
      messageId: msgId,
      createdAt: now
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send reply.' });
  }
});

// Admin: Toggle thread resolved status
router.post('/admin/resolve/:userId', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { userId } = req.params;
    const { resolved } = req.body;

    db.prepare(`
      UPDATE support_messages SET is_resolved = ? WHERE user_id = ?
    `).run(resolved ? 1 : 0, userId);

    res.status(200).json({ success: true, is_resolved: resolved ? 1 : 0 });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update resolution status.' });
  }
});

export default router;
