import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, RefreshCw, KeyRound, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import Logo from '../components/Logo.tsx';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
  openEmailModal: () => void;
  onNavigateToVerify?: (email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab, openEmailModal, onNavigateToVerify }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password & Reset State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'confirm'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      setCurrentTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    setResetLoading(true);

    try {
      await api.forgotPassword(resetEmail);
      setResetSuccess(`A 5-digit reset code has been sent to ${resetEmail}.`);
      setResetStep('confirm');
    } catch (err: any) {
      setResetError(err.message || 'Failed to dispatch password reset code.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }

    setResetLoading(true);
    try {
      await api.resetPassword({
        email: resetEmail,
        code: resetCode.trim(),
        new_password: newPassword,
        confirm_password: confirmNewPassword,
      });

      setResetSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setForgotModalOpen(false);
        setResetStep('request');
        setPassword('');
      }, 1500);
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password. Incorrect code.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="lg" variant="light" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Sign In to Account
          </h2>
          <p className="text-xs text-stone-400">
            Access your agricultural livestock investments & balance
          </p>
        </div>

        {/* Login Box */}
        <div className="p-8 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {error.toLowerCase().includes('not yet verified') && (
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToVerify) {
                      onNavigateToVerify(email);
                    } else {
                      setCurrentTab('register');
                    }
                  }}
                  className="mt-1 self-start px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors"
                >
                  Verify Account Now (Enter 5-Digit Code)
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kwame@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setForgotModalOpen(true);
                  }}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-white"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Admin Credential Helper */}
          <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <div>
              <span className="text-stone-300 font-semibold block">Demo Admin:</span>
              <span className="font-mono text-amber-300">admin@agricultureinvestment.com</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@agricultureinvestment.com');
                setPassword('AdminAgro2026!');
              }}
              className="px-2.5 py-1 text-[10px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
            >
              Autofill
            </button>
          </div>

          <div className="pt-2 border-t border-stone-800 text-center text-xs text-stone-400">
            Don't have an account yet?{' '}
            <button
              onClick={() => setCurrentTab('register')}
              className="text-amber-400 font-semibold hover:underline"
            >
              Register & Verify here
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-stone-950 border border-emerald-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-900 text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-stone-400">5-digit authorization code flow</p>
              </div>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700 text-xs text-emerald-200">
                {resetSuccess}
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="text-xs text-stone-300 block mb-1">Enter your registered email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="kwame@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors"
                  >
                    {resetLoading ? 'Sending...' : 'Send 5-Digit Reset Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-3">
                <div>
                  <label className="text-xs text-stone-300 block mb-1">5-Digit Security Code (Check email)</label>
                  <input
                    type="text"
                    maxLength={5}
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="5-digit code"
                    className="w-full px-4 py-2 text-center font-mono text-xl tracking-widest rounded-xl bg-stone-900 border border-emerald-800 text-amber-400 focus:outline-none"
                  />
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      onClick={openEmailModal}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Inspect Dispatched Codes
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-300 block mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-300 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    {resetLoading ? 'Resetting...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
