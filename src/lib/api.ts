import { 
  UserProfile, 
  UserMetrics, 
  LivestockPackage, 
  Investment, 
  Deposit, 
  Withdrawal, 
  TransactionLedger, 
  NotificationItem, 
  SupportMessage, 
  SupportThread, 
  SiteSettings, 
  AdminMetrics, 
  EmailLog 
} from '../types.ts';

const TOKEN_KEY = 'agro_invest_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) => request<{ success: boolean; message: string; email: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  verifyEmail: (payload: { email: string; code: string }) => request<{ success: boolean; message: string; token: string; user: UserProfile }>('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  resendCode: (email: string) => request<{ success: boolean; message: string }>('/api/auth/resend-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  login: (payload: any) => request<{ success: boolean; token: string; user: UserProfile }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  forgotPassword: (email: string) => request<{ success: boolean; message: string; email?: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  resetPassword: (payload: any) => request<{ success: boolean; message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getMe: () => request<{ user: UserProfile; metrics: UserMetrics }>('/api/auth/me'),

  updateProfile: (payload: { full_name: string; phone?: string }) => request<{ success: boolean; message: string }>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  changePassword: (payload: any) => request<{ success: boolean; message: string }>('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  // Packages & Investments
  getPackages: () => request<{ packages: LivestockPackage[] }>('/api/investments/packages'),
  
  invest: (packageId: string) => request<{ success: boolean; message: string; investmentId: string; maturityTime: string; newBalance: number }>('/api/investments/invest', {
    method: 'POST',
    body: JSON.stringify({ package_id: packageId }),
  }),

  getMyInvestments: () => request<{ investments: Investment[] }>('/api/investments/history'),

  // Deposits
  getDepositInfo: () => request<{ settings: SiteSettings; deposits: Deposit[] }>('/api/deposits/info'),

  submitDeposit: (payload: { amount: number; transaction_reference: string; mobile_number?: string; network?: string; proof_image_url?: string }) => 
    request<{ success: boolean; message: string; depositId: string }>('/api/deposits/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Withdrawals
  getMyWithdrawals: () => request<{ minWithdrawal: number; withdrawals: Withdrawal[] }>('/api/withdrawals/my'),

  submitWithdrawal: (payload: { amount: number; network: string; mobile_number: string; account_holder_name: string }) =>
    request<{ success: boolean; message: string; withdrawalId: string; newBalance: number }>('/api/withdrawals/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Notifications
  getMyNotifications: () => request<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications/my'),
  markNotificationRead: (id: string) => request<{ success: boolean }>(`/api/notifications/mark-read/${id}`, { method: 'POST' }),
  markAllNotificationsRead: () => request<{ success: boolean }>('/api/notifications/mark-all-read', { method: 'POST' }),

  // Transactions
  getMyTransactions: () => request<{ transactions: TransactionLedger[] }>('/api/transactions/my'),

  // Live Support
  getMyMessages: () => request<{ messages: SupportMessage[] }>('/api/support/my'),
  sendSupportMessage: (message: string) => request<{ success: boolean; messageId: string; createdAt: string }>('/api/support/send', {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),

  // Public Site Settings
  getSiteSettings: () => request<{ settings: SiteSettings }>('/api/admin/settings'),

  // Admin APIs
  getAdminMetrics: () => request<AdminMetrics>('/api/admin/metrics'),
  getAdminUsers: (search?: string) => request<{ users: any[] }>(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  toggleUserSuspension: (userId: string) => request<{ success: boolean; is_suspended: number; message: string }>(`/api/admin/users/${userId}/toggle-suspend`, { method: 'POST' }),

  getAdminDeposits: (status?: string) => request<{ deposits: Deposit[] }>(`/api/deposits/admin/all${status ? `?status=${status}` : ''}`),
  approveDeposit: (id: string, adminNotes?: string) => request<{ success: boolean; message: string }>(`/api/deposits/admin/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ admin_notes: adminNotes }),
  }),
  declineDeposit: (id: string, declineReason: string) => request<{ success: boolean; message: string }>(`/api/deposits/admin/${id}/decline`, {
    method: 'POST',
    body: JSON.stringify({ decline_reason: declineReason }),
  }),

  getAdminInvestments: (status?: string) => request<{ investments: Investment[] }>(`/api/investments/admin/all${status ? `?status=${status}` : ''}`),
  completeInvestmentCycle: (id: string) => request<{ success: boolean; message: string }>(`/api/investments/admin/${id}/complete-cycle`, { method: 'POST' }),
  getAdminPackages: () => request<{ packages: LivestockPackage[] }>('/api/investments/admin/packages'),
  updatePackage: (id: string, payload: any) => request<{ success: boolean; message: string }>(`/api/investments/admin/packages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  createPackage: (payload: any) => request<{ success: boolean; message: string; packageId: string }>('/api/investments/admin/packages', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getAdminWithdrawals: (status?: string) => request<{ withdrawals: Withdrawal[] }>(`/api/withdrawals/admin/all${status ? `?status=${status}` : ''}`),
  approveWithdrawal: (id: string, paymentReference: string) => request<{ success: boolean; message: string }>(`/api/withdrawals/admin/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ payment_reference: paymentReference }),
  }),
  declineWithdrawal: (id: string, declineReason: string) => request<{ success: boolean; message: string }>(`/api/withdrawals/admin/${id}/decline`, {
    method: 'POST',
    body: JSON.stringify({ decline_reason: declineReason }),
  }),

  getSupportThreads: () => request<{ threads: SupportThread[] }>('/api/support/admin/threads'),
  getSupportThread: (userId: string) => request<{ messages: SupportMessage[]; user: any }>(`/api/support/admin/thread/${userId}`),
  replySupportMessage: (userId: string, message: string) => request<{ success: boolean; messageId: string }>(`/api/support/admin/reply`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, message }),
  }),
  resolveSupportThread: (userId: string, resolved: boolean) => request<{ success: boolean }>(`/api/support/admin/resolve/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ resolved }),
  }),

  updateSiteSettings: (payload: any) => request<{ success: boolean; message: string }>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  getEmailLogs: () => request<{ logs: EmailLog[] }>('/api/admin/email-logs'),
  getLedgerTransactions: () => request<{ transactions: TransactionLedger[] }>('/api/admin/transactions'),
  getSupabaseStatus: () => request<any>('/api/admin/supabase-status'),
  testSupabase: () => request<any>('/api/admin/supabase-test', { method: 'POST' }),
};
