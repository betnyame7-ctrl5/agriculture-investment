export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  is_verified: number;
  is_suspended?: number;
  phone?: string;
  created_at: string;
}

export interface UserMetrics {
  availableBalance: number;
  totalConfirmedDeposits: number;
  activeInvestmentsCount: number;
  activeInvestmentsPrincipal: number;
  totalEarnings: number;
  totalWithdrawals: number;
  unreadNotifications: number;
}

export interface LivestockPackage {
  id: string;
  name: string;
  animal_type: string;
  contribution_amount: number;
  duration_hours: number;
  projected_return_min: number;
  projected_return_max: number;
  description: string;
  business_activity: string;
  risk_factors: string;
  image_url: string;
  is_active: number;
  created_at?: string;
}

export interface Investment {
  id: string;
  user_id: string;
  package_id: string;
  package_name: string;
  contribution_amount: number;
  projected_return: number;
  actual_return: number;
  duration_hours: number;
  start_time: string;
  maturity_time: string;
  status: 'active' | 'completed' | 'cancelled';
  business_yield_notes?: string;
  completed_at?: string;
  created_at: string;
  image_url?: string;
  animal_type?: string;
  full_name?: string;
  email?: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  network: string;
  mobile_number: string;
  account_name: string;
  transaction_reference: string;
  proof_image_url?: string;
  status: 'pending' | 'approved' | 'declined';
  admin_notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  full_name?: string;
  email?: string;
  user_phone?: string;
  current_balance?: number;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  network: 'TELECEL' | 'MTN';
  mobile_number: string;
  account_holder_name: string;
  status: 'pending' | 'approved' | 'declined';
  payment_reference?: string;
  decline_reason?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
  full_name?: string;
  email?: string;
  current_balance?: number;
}

export interface TransactionLedger {
  id: string;
  user_id: string;
  type: 'deposit' | 'investment_debit' | 'investment_payout' | 'withdrawal_payout' | 'withdrawal_refund' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_id?: string;
  description: string;
  created_at: string;
  full_name?: string;
  email?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  user_id: string;
  sender_role: 'user' | 'admin';
  sender_name: string;
  message: string;
  is_read: number;
  is_resolved: number;
  created_at: string;
}

export interface SupportThread {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  unread_count: number;
  last_message_time: string;
  last_message: string;
  is_resolved: number;
}

export interface SiteSettings {
  id: string;
  momo_network: string;
  momo_number: string;
  momo_account_name: string;
  min_deposit: number;
  min_withdrawal: number;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  business_disclosure: string;
  updated_at: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalConfirmedDeposits: number;
  confirmedDepositsCount: number;
  totalPendingDeposits: number;
  pendingDepositsCount: number;
  totalInvestmentsAmount: number;
  totalInvestmentsCount: number;
  activeInvestmentsAmount: number;
  activeInvestmentsCount: number;
  pendingWithdrawalsAmount: number;
  pendingWithdrawalsCount: number;
  completedWithdrawalsAmount: number;
  completedWithdrawalsCount: number;
  unreadSupportCount: number;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  code: string;
  body: string;
  created_at: string;
}
