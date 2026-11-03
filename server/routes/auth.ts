import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db.js';
import { 
  generateToken, 
  generate5DigitCode, 
  sendEmailMessage, 
  createNotification, 
  requireAuth, 
  AuthenticatedRequest 
} from '../utils.js';

const router = Router();

// Register new user
router.post('/register', async (req, res): Promise<void> => {
  try {
    const { full_name, email, password, confirm_password, phone } = req.body;

    if (!full_name || !email || !password) {
      res.status(400).json({ error: 'Please provide full name, email, and password.' });
      return;
    }

    if (password !== confirm_password) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Prevent duplicate email registrations
    const existing = db.prepare('SELECT id, is_verified FROM profiles WHERE email = ?').get(normalizedEmail) as any;
    if (existing) {
      if (existing.is_verified) {
        res.status(400).json({ error: 'An account with this email address is already registered. Please log in.' });
        return;
      } else {
        // Unverified account exists, re-issue new code
        const code = generate5DigitCode();
        const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        db.prepare(`
          UPDATE profiles 
          SET verification_code = ?, verification_expires = ?, full_name = ?, updated_at = ?
          WHERE id = ?
        `).run(code, expires, full_name, new Date().toISOString(), existing.id);

        await sendEmailMessage(
          normalizedEmail,
          'Your 5-Digit Email Verification Code - Agriculture Investment',
          code,
          `Hello ${full_name},\n\nThank you for registering on the Agriculture Investment platform.\nYour 5-digit verification code is: ${code}\nThis code will expire in 15 minutes.\n\nBest regards,\nAgriculture Investment Team`
        );

        res.status(200).json({
          success: true,
          message: 'An unverified account exists. A new 5-digit verification code has been dispatched to your email.',
          email: normalizedEmail
        });
        return;
      }
    }

    // Generate random 5-digit code and 15 min expiry
    const verificationCode = generate5DigitCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = 'usr_' + crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO profiles (
        id, full_name, email, password_hash, role, balance, is_verified, is_suspended,
        verification_code, verification_expires, phone, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'user', 0.0, 0, 0, ?, ?, ?, ?, ?)
    `).run(
      userId,
      full_name.trim(),
      normalizedEmail,
      passwordHash,
      verificationCode,
      verificationExpires,
      phone ? phone.trim() : null,
      now,
      now
    );

    // Send code to user's email via email dispatcher (never returns code to response UI)
    await sendEmailMessage(
      normalizedEmail,
      'Your 5-Digit Email Verification Code - Agriculture Investment',
      verificationCode,
      `Hello ${full_name.trim()},\n\nWelcome to Agriculture Investment!\n\nYour 5-digit account verification code is: ${verificationCode}\nThis code is valid for 15 minutes.\n\nIf you did not create this account, please ignore this email.\n\nWarm regards,\nAgriculture Investment Operations`
    );

    createNotification(
      userId,
      'Welcome to Agriculture Investment',
      'Your account has been created. Please verify your email with the 5-digit code sent to your inbox to unlock all platform features.',
      'info'
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! A 5-digit verification code has been sent to your email address.',
      email: normalizedEmail
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to complete registration. Please try again.' });
  }
});

// Verify email code
router.post('/verify-email', (req, res): void => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Please enter your email and 5-digit verification code.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    const user = db.prepare(`
      SELECT id, full_name, email, role, balance, is_verified, is_suspended, verification_code, verification_expires
      FROM profiles WHERE email = ?
    `).get(normalizedEmail) as any;

    if (!user) {
      res.status(404).json({ error: 'Account not found with this email.' });
      return;
    }

    if (user.is_verified) {
      res.status(200).json({
        success: true,
        message: 'Account is already verified. You can log in now.',
        alreadyVerified: true
      });
      return;
    }

    if (!user.verification_code || user.verification_code !== cleanCode) {
      res.status(400).json({ error: 'Incorrect 5-digit verification code. Please check and try again.' });
      return;
    }

    // Check expiration
    if (new Date(user.verification_expires) < new Date()) {
      res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      return;
    }

    // Mark as verified and clear code
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE profiles 
      SET is_verified = 1, verification_code = NULL, verification_expires = NULL, updated_at = ?
      WHERE id = ?
    `).run(now, user.id);

    createNotification(
      user.id,
      'Email Verified Successfully',
      'Congratulations! Your account is now fully active. You can deposit funds and invest in livestock packages.',
      'success'
    );

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    });

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        is_verified: 1
      }
    });
  } catch (err: any) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// Resend verification code
router.post('/resend-code', async (req, res): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required to resend verification code.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, full_name, is_verified FROM profiles WHERE email = ?').get(normalizedEmail) as any;

    if (!user) {
      res.status(404).json({ error: 'Account not found with this email.' });
      return;
    }

    if (user.is_verified) {
      res.status(400).json({ error: 'Account is already verified. Please sign in.' });
      return;
    }

    const newCode = generate5DigitCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    db.prepare(`
      UPDATE profiles 
      SET verification_code = ?, verification_expires = ?, updated_at = ?
      WHERE id = ?
    `).run(newCode, expires, new Date().toISOString(), user.id);

    await sendEmailMessage(
      normalizedEmail,
      'New 5-Digit Verification Code - Agriculture Investment',
      newCode,
      `Hello ${user.full_name},\n\nHere is your new 5-digit verification code: ${newCode}\nValid for 15 minutes.\n\nBest regards,\nAgriculture Investment Team`
    );

    res.status(200).json({
      success: true,
      message: 'A new 5-digit verification code has been dispatched to your email.'
    });
  } catch (err: any) {
    console.error('Resend code error:', err);
    res.status(500).json({ error: 'Failed to resend verification code.' });
  }
});

// Login
router.post('/login', (req, res): void => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please enter your email and password.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare(`
      SELECT id, full_name, email, password_hash, role, balance, is_verified, is_suspended, phone
      FROM profiles WHERE email = ?
    `).get(normalizedEmail) as any;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Only verified users can access their accounts
    if (!user.is_verified && user.role !== 'admin') {
      res.status(403).json({
        error: 'Your email address is not yet verified. Please verify using the 5-digit code sent to your email.',
        unverified: true,
        email: user.email
      });
      return;
    }

    if (user.is_suspended) {
      res.status(403).json({ error: 'Your account has been suspended by administration. Please contact support.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    });

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        is_verified: user.is_verified,
        phone: user.phone
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Forgot password request (sends 5-digit reset code)
router.post('/forgot-password', async (req, res): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Please provide your account email address.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, full_name FROM profiles WHERE email = ?').get(normalizedEmail) as any;

    if (!user) {
      // Do not reveal if email exists for security, but return generic success
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a 5-digit password reset code has been sent.'
      });
      return;
    }

    const resetCode = generate5DigitCode();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    db.prepare(`
      UPDATE profiles 
      SET reset_code = ?, reset_expires = ?, updated_at = ?
      WHERE id = ?
    `).run(resetCode, resetExpires, new Date().toISOString(), user.id);

    await sendEmailMessage(
      normalizedEmail,
      'Password Reset Code - Agriculture Investment',
      resetCode,
      `Hello ${user.full_name},\n\nWe received a request to reset your password.\nYour 5-digit password reset code is: ${resetCode}\nThis code will expire in 15 minutes.\n\nIf you did not request this, please secure your account.\n\nBest regards,\nAgriculture Investment Security Team`
    );

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a 5-digit password reset code has been sent.',
      email: normalizedEmail
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

// Reset password with code
router.post('/reset-password', (req, res): void => {
  try {
    const { email, code, new_password, confirm_password } = req.body;

    if (!email || !code || !new_password) {
      res.status(400).json({ error: 'Email, 5-digit reset code, and new password are required.' });
      return;
    }

    if (new_password !== confirm_password) {
      res.status(400).json({ error: 'New passwords do not match.' });
      return;
    }

    if (new_password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    const user = db.prepare(`
      SELECT id, reset_code, reset_expires FROM profiles WHERE email = ?
    `).get(normalizedEmail) as any;

    if (!user || !user.reset_code || user.reset_code !== cleanCode) {
      res.status(400).json({ error: 'Invalid or incorrect password reset code.' });
      return;
    }

    if (new Date(user.reset_expires) < new Date()) {
      res.status(400).json({ error: 'Password reset code has expired. Please request a new one.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(new_password, salt);
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE profiles 
      SET password_hash = ?, reset_code = NULL, reset_expires = NULL, updated_at = ?
      WHERE id = ?
    `).run(passwordHash, now, user.id);

    createNotification(
      user.id,
      'Password Changed',
      'Your account password has been successfully updated. If you did not make this change, please contact support immediately.',
      'info'
    );

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You may now log in with your new password.'
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// Current user profile & real metrics
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const user = db.prepare(`
      SELECT id, full_name, email, role, balance, is_verified, phone, created_at
      FROM profiles WHERE id = ?
    `).get(userId) as any;

    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    // Calculate real database figures
    const totalDeposits = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM deposits 
      WHERE user_id = ? AND status = 'approved'
    `).get(userId) as { total: number };

    const activeInvestments = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(contribution_amount), 0) as total_principal
      FROM investments WHERE user_id = ? AND status = 'active'
    `).get(userId) as { count: number; total_principal: number };

    const totalWithdrawals = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals 
      WHERE user_id = ? AND status = 'approved'
    `).get(userId) as { total: number };

    const actualEarnings = db.prepare(`
      SELECT COALESCE(SUM(actual_return), 0) as total FROM investments 
      WHERE user_id = ? AND status = 'completed'
    `).get(userId) as { total: number };

    const unreadNotifications = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `).get(userId) as { count: number };

    res.status(200).json({
      user,
      metrics: {
        availableBalance: user.balance,
        totalConfirmedDeposits: totalDeposits.total,
        activeInvestmentsCount: activeInvestments.count,
        activeInvestmentsPrincipal: activeInvestments.total_principal,
        totalEarnings: actualEarnings.total,
        totalWithdrawals: totalWithdrawals.total,
        unreadNotifications: unreadNotifications.count
      }
    });
  } catch (err: any) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile data.' });
  }
});

// Update profile details
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { full_name, phone } = req.body;
    if (!full_name || full_name.trim().length === 0) {
      res.status(400).json({ error: 'Full name cannot be empty.' });
      return;
    }

    db.prepare(`
      UPDATE profiles 
      SET full_name = ?, phone = ?, updated_at = ?
      WHERE id = ?
    `).run(full_name.trim(), phone ? phone.trim() : null, new Date().toISOString(), req.user!.id);

    res.status(200).json({ success: true, message: 'Profile updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Change password
router.put('/change-password', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    if (!current_password || !new_password) {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }

    if (new_password !== confirm_password) {
      res.status(400).json({ error: 'New passwords do not match.' });
      return;
    }

    if (new_password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const user = db.prepare('SELECT password_hash FROM profiles WHERE id = ?').get(req.user!.id) as any;
    const isValid = bcrypt.compareSync(current_password, user.password_hash);
    if (!isValid) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(new_password, salt);
    db.prepare('UPDATE profiles SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(passwordHash, new Date().toISOString(), req.user!.id);

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// Testing Mailbox Inspector (allows users and testers to inspect outgoing 5-digit verification codes)
router.get('/mailbox-inspector', (req, res): void => {
  try {
    const email = req.query.email as string;
    let logs;
    if (email && email.trim()) {
      logs = db.prepare('SELECT id, recipient_email, subject, code, body, created_at FROM email_logs WHERE LOWER(recipient_email) = LOWER(?) ORDER BY created_at DESC LIMIT 10').all(email.trim());
    } else {
      logs = db.prepare('SELECT id, recipient_email, subject, code, body, created_at FROM email_logs ORDER BY created_at DESC LIMIT 25').all();
    }
    res.status(200).json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve mailbox logs.' });
  }
});

export default router;
