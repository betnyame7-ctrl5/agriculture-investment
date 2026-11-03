import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import Logo from '../components/Logo.tsx';

interface RegisterPageProps {
  setCurrentTab: (tab: string) => void;
  openEmailModal: () => void;
  initialEmail?: string;
  initialStep?: 'register' | 'verify';
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ 
  setCurrentTab, 
  openEmailModal,
  initialEmail = '',
  initialStep = 'register'
}) => {
  const { register, verifyEmail } = useAuth();

  // Step 1: Registration Form; Step 2: 5-Digit Verification Form
  const [step, setStep] = useState<'register' | 'verify'>(initialStep);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Sync if initialEmail or initialStep changes
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
    if (initialStep) setStep(initialStep);
  }, [initialEmail, initialStep]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle Step 1 Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        full_name: fullName,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
      });

      setSuccessMsg('Registration successful! A 5-digit verification code has been dispatched to your email address.');
      setStep('verify');
      startResendTimer();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2 Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (verificationCode.trim().length !== 5) {
      setError('Please enter the full 5-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, verificationCode.trim());
      setSuccessMsg('Email verified successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        setCurrentTab('dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Incorrect or expired code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Code
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      await api.resendCode(email);
      setSuccessMsg('A new 5-digit verification code has been dispatched to your email.');
      startResendTimer();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
            {step === 'register' ? 'Create Livestock Account' : 'Verify Your Email'}
          </h2>
          <p className="text-xs text-stone-400">
            {step === 'register'
              ? 'Join Ghana’s transparent agricultural livestock co-op'
              : `Enter the 5-digit security code sent to ${email}`}
          </p>
        </div>

        {/* Card Box */}
        <div className="p-8 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700 text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

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
                <p className="text-[10px] text-stone-500 mt-1">
                  A 5-digit verification code will be sent to this email.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">Mobile Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0507399029"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? 'Creating Account...' : 'Register'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="p-4 rounded-2xl bg-stone-900/80 border border-emerald-900 text-center space-y-2">
                <KeyRound className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-semibold text-white">Enter 5-Digit Verification Code</h4>
                <p className="text-xs text-stone-400">
                  We have dispatched a 5-digit verification code to your email inbox. The code expires in 15 minutes.
                </p>
                {/* Notice: As strictly required, the code is NOT displayed on screen! */}
                <p className="text-[11px] text-amber-300/80 font-mono">
                  [Code sent to {email}]
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={5}
                  required
                  autoFocus
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • •"
                  className="w-full text-center tracking-[1em] font-mono text-3xl font-extrabold py-3 rounded-xl bg-stone-900 border-2 border-emerald-800 text-amber-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Verify & Activate Account</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="text-amber-400 hover:underline disabled:text-stone-600 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Request another code'}
                </button>

                <button
                  type="button"
                  onClick={openEmailModal}
                  className="text-emerald-400 hover:underline text-[11px]"
                >
                  Check Dispatched Email Log
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-stone-800 text-center text-xs text-stone-400">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentTab('login')}
              className="text-amber-400 font-semibold hover:underline"
            >
              Sign In here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
