import React, { useState } from 'react';
import { Database, Copy, Check, X, ShieldCheck, Server, Key, ExternalLink } from 'lucide-react';

interface SupabaseDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseDocsModal: React.FC<SupabaseDocsModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const sqlCode = `-- Supabase PostgreSQL Table Setup
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  balance NUMERIC(12, 2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.investment_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  animal_type TEXT NOT NULL,
  contribution_amount NUMERIC(10, 2) NOT NULL,
  duration_hours INT DEFAULT 24,
  projected_return_min NUMERIC(10, 2) NOT NULL,
  projected_return_max NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  package_id TEXT NOT NULL REFERENCES public.investment_packages(id),
  package_name TEXT NOT NULL,
  contribution_amount NUMERIC(10, 2) NOT NULL,
  projected_return NUMERIC(10, 2) NOT NULL,
  actual_return NUMERIC(10, 2) DEFAULT 0.00,
  duration_hours INT DEFAULT 24,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  maturity_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 10.00),
  network TEXT NOT NULL DEFAULT 'TELECEL',
  mobile_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  transaction_reference TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined'))
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 10.00),
  network TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  payment_reference TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-emerald-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 to-green-900 border-b border-emerald-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-amber-300 border border-emerald-600/40">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white">Supabase Configuration & Architecture Guide</h3>
              <p className="text-xs text-emerald-200">Database tables, Row-Level-Security, Authentication & Migration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-200 flex-1">
          {/* Architecture Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/50">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
                <Server className="w-4 h-4" />
                <span>Integrated Express & SQLite Engine</span>
              </div>
              <p className="text-xs text-stone-300">
                The application comes bundled with an active backend engine and real database tables pre-seeded, running with zero latency.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Supabase Ready</span>
              </div>
              <p className="text-xs text-stone-300">
                Full PostgreSQL SQL schema with Row Level Security (RLS) policies and Auth triggers included in <code>supabase_schema.sql</code>.
              </p>
            </div>
          </div>

          {/* Quick Steps */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3">
              3-Step Supabase Connection
            </h4>
            <ol className="space-y-2 text-xs text-stone-300 list-decimal list-inside">
              <li className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                <strong className="text-white">Create a Supabase Project:</strong> Open <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a> and initialize a new project.
              </li>
              <li className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                <strong className="text-white">Paste SQL Schema:</strong> In Supabase SQL Editor, paste the SQL schema below to create the tables, constraints, and Row Level Security policies.
              </li>
              <li className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                <strong className="text-white">Set Environment Keys:</strong> Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment.
              </li>
            </ol>
          </div>

          {/* Code block */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                PostgreSQL SQL Schema (Preview)
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL!' : 'Copy Full SQL'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-60">
              {sqlCode}
            </pre>
          </div>

          {/* Default Admin */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 block">Pre-configured Admin Credentials:</span>
              <span className="text-sm font-mono text-amber-300 font-bold">admin@agricultureinvestment.com</span>
              <span className="text-xs text-stone-400 block mt-0.5">Password: <span className="font-mono text-white">AdminAgro2026!</span></span>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
              Verified Role: admin
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDocsModal;
