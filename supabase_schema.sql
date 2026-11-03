-- ====================================================================
-- AGRICULTURE INVESTMENT PLATFORM - SUPABASE SCHEMA & RLS POLICIES
-- ====================================================================

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  balance NUMERIC(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  verification_code TEXT,
  verification_expires TIMESTAMPTZ,
  reset_code TEXT,
  reset_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Investment Packages
CREATE TABLE IF NOT EXISTS public.investment_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  animal_type TEXT NOT NULL,
  contribution_amount NUMERIC(10, 2) NOT NULL CHECK (contribution_amount > 0),
  duration_hours INT DEFAULT 24,
  projected_return_min NUMERIC(10, 2) NOT NULL,
  projected_return_max NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  business_activity TEXT NOT NULL,
  risk_factors TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Investments Table
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL REFERENCES public.investment_packages(id),
  package_name TEXT NOT NULL,
  contribution_amount NUMERIC(10, 2) NOT NULL,
  projected_return NUMERIC(10, 2) NOT NULL,
  actual_return NUMERIC(10, 2) DEFAULT 0.00,
  duration_hours INT DEFAULT 24,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  maturity_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  business_yield_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Deposits Table
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 10.00),
  network TEXT NOT NULL DEFAULT 'TELECEL',
  mobile_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  transaction_reference TEXT UNIQUE NOT NULL,
  proof_image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  admin_notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 10.00),
  network TEXT NOT NULL CHECK (network IN ('TELECEL', 'MTN')),
  mobile_number TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  payment_reference TEXT,
  decline_reason TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Financial Ledger Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'investment_debit', 'investment_payout', 'withdrawal_payout', 'withdrawal_refund', 'adjustment')),
  amount NUMERIC(10, 2) NOT NULL,
  balance_before NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL,
  reference_id TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Support Messages Table
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('user', 'admin')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  momo_network TEXT NOT NULL DEFAULT 'TELECEL',
  momo_number TEXT NOT NULL DEFAULT '0507399029',
  momo_account_name TEXT NOT NULL DEFAULT 'JOYCE ASABEA',
  min_deposit NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
  min_withdrawal NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
  contact_email TEXT NOT NULL DEFAULT 'support@agricultureinvestment.com',
  contact_phone TEXT NOT NULL DEFAULT '+233 50 739 9029',
  contact_address TEXT NOT NULL DEFAULT 'Agro-Hub Complex, Sunyani Road, Kumasi, Ghana',
  business_disclosure TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an administrator?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users view own profile or admin views all" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users update own basic info" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Investment Packages Policies
CREATE POLICY "Everyone can read active packages" ON public.investment_packages
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admin can modify packages" ON public.investment_packages
  FOR ALL USING (public.is_admin());

-- Investments Policies
CREATE POLICY "Users view own investments or admin views all" ON public.investments
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Deposits Policies
CREATE POLICY "Users view own deposits or admin views all" ON public.deposits
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own deposit" ON public.deposits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admin can update deposits" ON public.deposits
  FOR UPDATE USING (public.is_admin());

-- Withdrawals Policies
CREATE POLICY "Users view own withdrawals or admin views all" ON public.withdrawals
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own withdrawal" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admin can update withdrawals" ON public.withdrawals
  FOR UPDATE USING (public.is_admin());

-- Ledger Transactions Policies
CREATE POLICY "Users view own transactions or admin views all" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Notifications Policies
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notification read state" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Support Messages Policies
CREATE POLICY "Users view own support messages or admin views all" ON public.support_messages
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert support message" ON public.support_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Site Settings Policies
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin can update site settings" ON public.site_settings
  FOR ALL USING (public.is_admin());
