import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, ArrowDownToLine, ArrowUpFromLine, Layers, 
  MessageSquare, Settings, Mail, RefreshCw, CheckCircle2, 
  XCircle, Search, Edit3, Plus, ExternalLink, AlertTriangle, 
  Eye, Check, X, FileText, Database 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { 
  AdminMetrics, Deposit, Withdrawal, Investment, LivestockPackage, 
  SiteSettings, SupportThread, SupportMessage, EmailLog, TransactionLedger 
} from '../types.ts';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'deposits' | 'investments' | 'withdrawals' | 'support' | 'settings' | 'logs' | 'supabase'
  >('overview');

  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestReport, setSupabaseTestReport] = useState<any>(null);

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Deposits State
  const [depositsList, setDepositsList] = useState<Deposit[]>([]);
  const [depositFilter, setDepositFilter] = useState('all');
  const [declineModalDeposit, setDeclineModalDeposit] = useState<Deposit | null>(null);
  const [declineDepositReason, setDeclineDepositReason] = useState('');

  // Investments State
  const [investmentsList, setInvestmentsList] = useState<Investment[]>([]);
  const [packagesList, setPackagesList] = useState<LivestockPackage[]>([]);
  const [editingPackage, setEditingPackage] = useState<LivestockPackage | null>(null);

  // Withdrawals State
  const [withdrawalsList, setWithdrawalsList] = useState<Withdrawal[]>([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState('all');
  const [approveModalWithdrawal, setApproveModalWithdrawal] = useState<Withdrawal | null>(null);
  const [paymentReferenceInput, setPaymentReferenceInput] = useState('');
  const [declineModalWithdrawal, setDeclineModalWithdrawal] = useState<Withdrawal | null>(null);
  const [declineWithdrawalReason, setDeclineWithdrawalReason] = useState('');

  // Support State
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedThreadUser, setSelectedThreadUser] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<SupportMessage[]>([]);
  const [threadUserDetails, setThreadUserDetails] = useState<any | null>(null);
  const [replyInput, setReplyInput] = useState('');

  // Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState<any>({});

  // Email Logs State
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  // Load Main Data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [metricsRes, settingsRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getSiteSettings(),
      ]);
      setMetrics(metricsRes);
      setSiteSettings(settingsRes.settings);
      setSettingsForm(settingsRes.settings || {});

      // Load specific tab data
      if (activeTab === 'users' || activeTab === 'overview') {
        const uRes = await api.getAdminUsers(userSearch);
        setUsersList(uRes.users || []);
      }
      if (activeTab === 'deposits' || activeTab === 'overview') {
        const dRes = await api.getAdminDeposits(depositFilter);
        setDepositsList(dRes.deposits || []);
      }
      if (activeTab === 'investments' || activeTab === 'overview') {
        const [iRes, pRes] = await Promise.all([
          api.getAdminInvestments(),
          api.getAdminPackages(),
        ]);
        setInvestmentsList(iRes.investments || []);
        setPackagesList(pRes.packages || []);
      }
      if (activeTab === 'withdrawals' || activeTab === 'overview') {
        const wRes = await api.getAdminWithdrawals(withdrawalFilter);
        setWithdrawalsList(wRes.withdrawals || []);
      }
      if (activeTab === 'support' || activeTab === 'overview') {
        const sRes = await api.getSupportThreads();
        setThreads(sRes.threads || []);
      }
      if (activeTab === 'logs') {
        const lRes = await api.getEmailLogs();
        setEmailLogs(lRes.logs || []);
      }
      if (activeTab === 'supabase' || activeTab === 'overview') {
        try {
          const sStatus = await api.getSupabaseStatus();
          setSupabaseStatus(sStatus);
          setSupabaseTestReport(sStatus.testResult || {
            connected: sStatus.isConnected,
            message: sStatus.isConnected 
              ? `Connected to Supabase in ${sStatus.latencyMs}ms.` 
              : sStatus.errorMsg || 'Local high-performance engine active with full Supabase PostgreSQL schema compatibility.'
          });
        } catch (e) {
          console.warn('Could not load Supabase status:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSupabaseTest = async () => {
    setTestingSupabase(true);
    try {
      const res = await api.testSupabase();
      setSupabaseTestReport(res);
      setActionMessage(res.message);
    } catch (err: any) {
      setSupabaseTestReport({ connected: false, message: err.message || 'Connection test failed.' });
    } finally {
      setTestingSupabase(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [activeTab, depositFilter, withdrawalFilter]);

  // Load selected support thread
  useEffect(() => {
    if (selectedThreadUser) {
      api.getSupportThread(selectedThreadUser).then((res) => {
        setThreadMessages(res.messages || []);
        setThreadUserDetails(res.user || null);
      });
    }
  }, [selectedThreadUser]);

  // Actions
  const handleToggleSuspendUser = async (userId: string) => {
    try {
      const res = await api.toggleUserSuspension(userId);
      setActionMessage(res.message);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle suspension.');
    }
  };

  const handleApproveDeposit = async (id: string) => {
    if (!confirm('Confirm approval of this Mobile Money deposit? Funds will be credited to user balance.')) return;
    setActionLoading(true);
    try {
      const res = await api.approveDeposit(id, 'Verified against official Mobile Money account statement');
      setActionMessage(res.message);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineDepositSubmit = async () => {
    if (!declineModalDeposit || !declineDepositReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.declineDeposit(declineModalDeposit.id, declineDepositReason.trim());
      setActionMessage(res.message);
      setDeclineModalDeposit(null);
      setDeclineDepositReason('');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to decline deposit.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveWithdrawalSubmit = async () => {
    if (!approveModalWithdrawal || !paymentReferenceInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.approveWithdrawal(approveModalWithdrawal.id, paymentReferenceInput.trim());
      setActionMessage(res.message);
      setApproveModalWithdrawal(null);
      setPaymentReferenceInput('');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve withdrawal.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineWithdrawalSubmit = async () => {
    if (!declineModalWithdrawal || !declineWithdrawalReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.declineWithdrawal(declineModalWithdrawal.id, declineWithdrawalReason.trim());
      setActionMessage(res.message);
      setDeclineModalWithdrawal(null);
      setDeclineWithdrawalReason('');
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to decline withdrawal.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteCycleManual = async (invId: string) => {
    if (!confirm('Trigger completion for this livestock cycle? Principal and documented yield will be credited to user.')) return;
    try {
      const res = await api.completeInvestmentCycle(invId);
      setActionMessage(res.message);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete cycle.');
    }
  };

  const handleSendSupportReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreadUser || !replyInput.trim()) return;
    try {
      await api.replySupportMessage(selectedThreadUser, replyInput.trim());
      setReplyInput('');
      const res = await api.getSupportThread(selectedThreadUser);
      setThreadMessages(res.messages || []);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.updateSiteSettings(settingsForm);
      setActionMessage(res.message);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    try {
      await api.updatePackage(editingPackage.id, editingPackage);
      setActionMessage(`Updated package ${editingPackage.name} successfully.`);
      setEditingPackage(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save package.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-stone-950 to-stone-900 border-2 border-amber-400/60 shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500 text-stone-950 shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  Administrator Command Center
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-stone-950">
                  Super Admin
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-0.5">
                Agriculture Investment Administration
              </h1>
              <p className="text-xs text-stone-400">
                Logged in as <span className="font-mono text-amber-300 font-bold">{user?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh All Data</span>
          </button>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-600 text-xs text-emerald-200 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-stone-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-stone-800 pb-3">
          {[
            { id: 'overview', label: 'Overview Analytics', icon: Shield },
            { id: 'deposits', label: 'Deposit Requests', icon: ArrowDownToLine, badge: metrics?.pendingDepositsCount },
            { id: 'withdrawals', label: 'Withdrawal Requests', icon: ArrowUpFromLine, badge: metrics?.pendingWithdrawalsCount },
            { id: 'investments', label: 'Livestock & Packages', icon: Layers },
            { id: 'users', label: 'User Management', icon: Users, badge: metrics?.totalUsers },
            { id: 'support', label: 'Live Support Desk', icon: MessageSquare, badge: metrics?.unreadSupportCount },
            { id: 'settings', label: 'MoMo & Site Settings', icon: Settings },
            { id: 'logs', label: 'Outgoing Email Logs', icon: Mail },
            { id: 'supabase', label: 'Supabase Cloud Backend', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-stone-950 text-amber-400' : 'bg-amber-500 text-stone-950'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW ANALYTICS TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-900 shadow-md">
                <span className="text-xs font-semibold text-stone-400 block mb-1">Total Registered Users</span>
                <span className="font-mono text-3xl font-extrabold text-white">{metrics?.totalUsers || 0}</span>
                <p className="text-[11px] text-emerald-400 mt-2">Active platform members</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-900 shadow-md">
                <span className="text-xs font-semibold text-stone-400 block mb-1">Confirmed Deposits</span>
                <span className="font-mono text-3xl font-extrabold text-emerald-300">
                  GH₵ {metrics?.totalConfirmedDeposits.toFixed(2) || '0.00'}
                </span>
                <p className="text-[11px] text-stone-400 mt-2">{metrics?.confirmedDepositsCount || 0} verified transactions</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950 border-2 border-amber-500/70 shadow-lg">
                <span className="text-xs font-bold text-amber-400 block mb-1">Pending Deposits</span>
                <span className="font-mono text-3xl font-extrabold text-amber-300">
                  GH₵ {metrics?.totalPendingDeposits.toFixed(2) || '0.00'}
                </span>
                <p className="text-[11px] text-stone-400 mt-2">{metrics?.pendingDepositsCount || 0} awaiting approval</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-900 shadow-md">
                <span className="text-xs font-semibold text-stone-400 block mb-1">Active Livestock Cycles</span>
                <span className="font-mono text-3xl font-extrabold text-white">
                  GH₵ {metrics?.activeInvestmentsAmount.toFixed(2) || '0.00'}
                </span>
                <p className="text-[11px] text-emerald-400 mt-2">{metrics?.activeInvestmentsCount || 0} active cycles</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950 border-2 border-rose-500/70 shadow-lg">
                <span className="text-xs font-bold text-rose-400 block mb-1">Pending Withdrawals</span>
                <span className="font-mono text-3xl font-extrabold text-rose-300">
                  GH₵ {metrics?.pendingWithdrawalsAmount.toFixed(2) || '0.00'}
                </span>
                <p className="text-[11px] text-stone-400 mt-2">{metrics?.pendingWithdrawalsCount || 0} requests awaiting transfer</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-900 shadow-md">
                <span className="text-xs font-semibold text-stone-400 block mb-1">Completed Withdrawals</span>
                <span className="font-mono text-3xl font-extrabold text-stone-200">
                  GH₵ {metrics?.completedWithdrawalsAmount.toFixed(2) || '0.00'}
                </span>
                <p className="text-[11px] text-stone-400 mt-2">{metrics?.completedWithdrawalsCount || 0} paid requests</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-900 shadow-md">
                <span className="text-xs font-semibold text-stone-400 block mb-1">Unread Support Chats</span>
                <span className="font-mono text-3xl font-extrabold text-amber-400">{metrics?.unreadSupportCount || 0}</span>
                <p className="text-[11px] text-stone-400 mt-2">Active user conversations</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-900 shadow-md">
                <span className="text-xs font-semibold text-stone-400 block mb-1">Total Livestock Packages</span>
                <span className="font-mono text-3xl font-extrabold text-emerald-400">{packagesList.length}</span>
                <p className="text-[11px] text-stone-400 mt-2">Dog, Goat, Cow & Custom</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. DEPOSIT MANAGEMENT TAB */}
        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Deposit Requests</h2>
                <p className="text-xs text-stone-400">Review submitted transaction references & approve balance credits</p>
              </div>

              <div className="flex gap-2">
                {(['all', 'pending', 'approved', 'declined'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setDepositFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                      depositFilter === st ? 'bg-amber-500 text-stone-950' : 'bg-stone-950 text-stone-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase bg-stone-900/60">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Network / Phone</th>
                      <th className="py-3 px-4">Transaction Reference</th>
                      <th className="py-3 px-4">Receipt Proof</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    {depositsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-500">
                          No deposits found matching this filter.
                        </td>
                      </tr>
                    ) : (
                      depositsList.map((dep) => (
                        <tr key={dep.id} className="hover:bg-stone-900/40">
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{dep.full_name}</span>
                            <span className="text-[11px] text-stone-400">{dep.email}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-base text-amber-300">
                            GH₵ {dep.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white block">{dep.network}</span>
                            <span className="font-mono text-stone-400">{dep.mobile_number}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-white uppercase">
                            {dep.transaction_reference}
                          </td>
                          <td className="py-3 px-4">
                            {dep.proof_image_url ? (
                              <a
                                href={dep.proof_image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Receipt</span>
                              </a>
                            ) : (
                              <span className="text-stone-500">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              dep.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : dep.status === 'declined'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                            }`}>
                              {dep.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {dep.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApproveDeposit(dep.id)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setDeclineModalDeposit(dep)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-stone-500 text-[11px] italic">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. WITHDRAWAL MANAGEMENT TAB */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Withdrawal Requests</h2>
                <p className="text-xs text-stone-400">Review pending user cashouts and record actual MoMo payment reference</p>
              </div>

              <div className="flex gap-2">
                {(['all', 'pending', 'approved', 'declined'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setWithdrawalFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                      withdrawalFilter === st ? 'bg-amber-500 text-stone-950' : 'bg-stone-950 text-stone-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase bg-stone-900/60">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Network</th>
                      <th className="py-3 px-4">Mobile Number & Name</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment Reference</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    {withdrawalsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-500">
                          No withdrawals found matching this filter.
                        </td>
                      </tr>
                    ) : (
                      withdrawalsList.map((wth) => (
                        <tr key={wth.id} className="hover:bg-stone-900/40">
                          <td className="py-3 px-4">
                            <span className="font-bold text-white block">{wth.full_name}</span>
                            <span className="text-[11px] text-stone-400">{wth.email}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-base text-amber-300">
                            GH₵ {wth.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">{wth.network}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-white block">{wth.mobile_number}</span>
                            <span className="text-stone-400">{wth.account_holder_name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              wth.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : wth.status === 'declined'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                            }`}>
                              {wth.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400">
                            {wth.payment_reference || wth.decline_reason || '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {wth.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setApproveModalWithdrawal(wth)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white"
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() => setDeclineModalWithdrawal(wth)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                                >
                                  Decline & Refund
                                </button>
                              </div>
                            ) : (
                              <span className="text-stone-500 text-[11px] italic">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. LIVESTOCK PACKAGES & CYCLES TAB */}
        {activeTab === 'investments' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Livestock Package Management</h2>
                <p className="text-xs text-stone-400">Manage contribution amounts, projected margins, descriptions, and pictures</p>
              </div>
            </div>

            {/* Package Cards Admin View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packagesList.map((pkg) => (
                <div key={pkg.id} className="p-6 rounded-3xl bg-stone-950 border border-emerald-900 shadow-xl space-y-4">
                  <div className="h-40 rounded-2xl overflow-hidden relative">
                    <img src={pkg.image_url} alt={pkg.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md text-[10px] font-bold bg-stone-950/80 text-amber-400 font-mono">
                      GH₵ {pkg.contribution_amount.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{pkg.name}</h4>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">{pkg.description}</p>
                    <div className="mt-3 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Duration:</span>
                        <span className="font-mono text-white">{pkg.duration_hours} Hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Yield Range:</span>
                        <span className="font-mono text-emerald-400">GH₵ {pkg.projected_return_min.toFixed(2)} - GH₵ {pkg.projected_return_max.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingPackage(pkg)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 border border-emerald-700 flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Package Details</span>
                  </button>
                </div>
              ))}
            </div>

            {/* All Active User Cycles Table */}
            <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 shadow-xl space-y-4">
              <h3 className="text-lg font-serif font-bold text-white">All Active & Historic Livestock Cycles</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase bg-stone-900/50">
                      <th className="py-2.5 px-3">Investor</th>
                      <th className="py-2.5 px-3">Package</th>
                      <th className="py-2.5 px-3">Principal</th>
                      <th className="py-2.5 px-3">Yield</th>
                      <th className="py-2.5 px-3">Start Time</th>
                      <th className="py-2.5 px-3">Maturity Time</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    {investmentsList.map((inv) => (
                      <tr key={inv.id} className="hover:bg-stone-900/40">
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{inv.full_name}</span>
                          <span className="text-[10px] text-stone-400">{inv.email}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">{inv.package_name}</td>
                        <td className="py-3 px-3 font-mono font-bold text-white">GH₵ {inv.contribution_amount.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono text-emerald-400 font-bold">GH₵ {inv.actual_return > 0 ? inv.actual_return.toFixed(2) : inv.projected_return.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono text-stone-400 text-[11px]">{new Date(inv.start_time).toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono text-stone-400 text-[11px]">{new Date(inv.maturity_time).toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {inv.status === 'active' && (
                            <button
                              onClick={() => handleCompleteCycleManual(inv.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-stone-950"
                              title="Manually trigger harvest payout"
                            >
                              Mature Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Registered Users</h2>
                <p className="text-xs text-stone-400">Search users, view balances, and suspend or reactivate accounts</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    api.getAdminUsers(e.target.value).then(r => setUsersList(r.users || []));
                  }}
                  placeholder="Search name, email, phone..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase bg-stone-900/60">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Balance</th>
                      <th className="py-3 px-4">Total Deposited</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-900/40">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{u.full_name}</span>
                          <span className="text-[11px] text-stone-400">{u.email}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-300">{u.phone || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-900 border border-stone-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">
                          GH₵ {u.balance.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-400">
                          GH₵ {u.total_deposited.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {u.is_suspended ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleSuspendUser(u.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                u.is_suspended
                                  ? 'bg-emerald-900 text-emerald-200 hover:bg-emerald-800'
                                  : 'bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800'
                              }`}
                            >
                              {u.is_suspended ? 'Reactivate' : 'Suspend'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. SUPPORT MANAGEMENT TAB */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold text-white">Live Support Messages</h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
              {/* Thread List */}
              <div className="lg:col-span-4 rounded-3xl bg-stone-950 border border-stone-800 overflow-y-auto p-4 space-y-2">
                <span className="text-xs font-bold uppercase text-stone-400 block px-2 mb-2">
                  User Conversations ({threads.length})
                </span>
                {threads.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 text-xs">No conversations yet.</div>
                ) : (
                  threads.map((t) => (
                    <button
                      key={t.user_id}
                      onClick={() => setSelectedThreadUser(t.user_id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                        selectedThreadUser === t.user_id
                          ? 'bg-emerald-950/80 border-amber-400 shadow-md'
                          : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{t.full_name}</span>
                        {t.unread_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950">
                            {t.unread_count} new
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 truncate">{t.last_message}</p>
                      <span className="text-[10px] text-stone-500 block mt-1 font-mono">
                        {new Date(t.last_message_time).toLocaleTimeString()}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Chat Thread */}
              <div className="lg:col-span-8 rounded-3xl bg-stone-950 border border-stone-800 flex flex-col overflow-hidden">
                {selectedThreadUser && threadUserDetails ? (
                  <>
                    <div className="p-4 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-white text-sm">{threadUserDetails.full_name}</h4>
                        <span className="text-stone-400">{threadUserDetails.email} • Balance: GH₵ {threadUserDetails.balance.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-3">
                      {threadMessages.map((m) => {
                        const isAdmin = m.sender_role === 'admin';
                        return (
                          <div key={m.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-stone-400 mb-1">
                              {isAdmin ? 'Admin (You)' : threadUserDetails.full_name} • {new Date(m.created_at).toLocaleTimeString()}
                            </span>
                            <div
                              className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                                isAdmin
                                  ? 'bg-amber-500 text-stone-950 font-medium'
                                  : 'bg-stone-900 text-white border border-stone-800'
                              }`}
                            >
                              {m.message}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSendSupportReply} className="p-4 bg-stone-900 border-t border-stone-800 flex gap-2">
                      <input
                        type="text"
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        placeholder="Type official admin reply..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        disabled={!replyInput.trim()}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors disabled:opacity-40"
                      >
                        Send Reply
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-stone-500 text-xs">
                    Select a user conversation from the left to read and reply.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 7. WEBSITE & MOMO SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <h2 className="text-xl font-serif font-bold text-white">Mobile Money & Website Settings</h2>
            <div className="p-8 rounded-3xl bg-stone-950 border border-emerald-900 shadow-xl">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">MoMo Network</label>
                    <input
                      type="text"
                      value={settingsForm.momo_network || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, momo_network: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">MoMo Mobile Number</label>
                    <input
                      type="text"
                      value={settingsForm.momo_number || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, momo_number: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={settingsForm.momo_account_name || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, momo_account_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Minimum Deposit (GH₵)</label>
                    <input
                      type="number"
                      value={settingsForm.min_deposit || 10}
                      onChange={(e) => setSettingsForm({ ...settingsForm, min_deposit: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Minimum Withdrawal (GH₵)</label>
                    <input
                      type="number"
                      value={settingsForm.min_withdrawal || 10}
                      onChange={(e) => setSettingsForm({ ...settingsForm, min_withdrawal: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Official Contact Email</label>
                  <input
                    type="email"
                    value={settingsForm.contact_email || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Official Office Address</label>
                  <input
                    type="text"
                    value={settingsForm.contact_address || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contact_address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Business & Risk Disclosure Text</label>
                  <textarea
                    rows={4}
                    value={settingsForm.business_disclosure || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, business_disclosure: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 focus:outline-none focus:border-amber-400"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-md disabled:opacity-50"
                >
                  Save Website Settings
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 8. OUTGOING EMAIL LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Dispatched 5-Digit Verification Email Logs</h2>
                <p className="text-xs text-stone-400">Sandbox audit trail of all email verification and password reset codes</p>
              </div>
            </div>

            <div className="rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase bg-stone-900/60">
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">5-Digit Code</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    {emailLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-stone-500">No email logs found yet.</td>
                      </tr>
                    ) : (
                      emailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-stone-900/40">
                          <td className="py-3 px-4 font-mono font-bold text-amber-300">{log.recipient_email}</td>
                          <td className="py-3 px-4 text-stone-300">{log.subject}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-base font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                              {log.code}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-stone-500 text-[11px]">{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 9. SUPABASE CLOUD BACKEND TAB */}
        {activeTab === 'supabase' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Supabase Cloud Backend Configuration</h2>
                <p className="text-xs text-stone-400">PostgreSQL database connection, Row-Level-Security, and live environment diagnostics</p>
              </div>

              <button
                onClick={handleRunSupabaseTest}
                disabled={testingSupabase}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
                <span>{testingSupabase ? 'Testing Connection...' : 'Run Diagnostics Test'}</span>
              </button>
            </div>

            {/* Connection Status Banner */}
            <div className="p-6 rounded-3xl bg-stone-950 border border-emerald-900 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${
                    supabaseTestReport?.connected ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-950 text-amber-400'
                  }`}>
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {supabaseStatus?.isConfigured ? 'Supabase Credentials Detected' : 'Local Database Engine Active (Supabase Compatible)'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        supabaseTestReport?.connected
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}>
                        {supabaseTestReport?.connected ? 'Online' : 'Standby / Local Engine'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {supabaseTestReport?.message || 'Ready for Supabase cloud PostgreSQL connection'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Supabase URL</span>
                  <span className="font-mono text-xs text-amber-300">
                    {supabaseStatus?.config?.url || 'https://your-project.supabase.co (Not configured)'}
                  </span>
                </div>
              </div>

              {/* Diagnostic Box */}
              {supabaseTestReport && (
                <div className={`p-4 rounded-2xl text-xs font-mono border ${
                  supabaseTestReport.connected
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-stone-900 border-stone-800 text-stone-300'
                }`}>
                  <strong className="block mb-1 text-white font-sans">Diagnostic Report:</strong>
                  <span>{supabaseTestReport.message}</span>
                </div>
              )}
            </div>

            {/* Supabase Schema & Tables Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-serif">
                  Required Supabase Tables (9 Active)
                </h4>
                <div className="space-y-2 text-xs">
                  {[
                    { name: 'profiles', desc: 'User accounts, balances, roles, and verification states' },
                    { name: 'investment_packages', desc: 'Dog, Goat, Cow contribution tiers and descriptions' },
                    { name: 'investments', desc: 'Active 24-hour cycles, maturity timestamps, and actual returns' },
                    { name: 'deposits', desc: 'Mobile Money submitted references, proofs, and approval status' },
                    { name: 'withdrawals', desc: 'Escrow cashout requests and actual payment references' },
                    { name: 'transactions', desc: 'Immutable double-entry financial ledger' },
                    { name: 'notifications', desc: 'In-app user alerts and messages' },
                    { name: 'support_messages', desc: 'Real-time support thread conversations' },
                    { name: 'site_settings', desc: 'Mobile Money numbers, account names, and disclosures' },
                  ].map((tbl) => (
                    <div key={tbl.name} className="p-2.5 rounded-xl bg-stone-900 border border-stone-800/80 flex items-center justify-between">
                      <div className="font-mono font-bold text-emerald-300">{tbl.name}</div>
                      <div className="text-[11px] text-stone-400 text-right">{tbl.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 font-serif">
                  Environment Configuration
                </h4>
                <p className="text-xs text-stone-300">
                  To connect your remote Supabase cloud project, set these variables in your <code>.env</code> file:
                </p>
                <pre className="p-4 rounded-2xl bg-stone-900 border border-stone-800 font-mono text-xs text-amber-300 overflow-x-auto">
{`# Supabase Project Connection Keys
VITE_SUPABASE_URL="https://your-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# JWT Secret & Port
JWT_SECRET="agro-invest-jwt-secure-secret-key-2026"
DEFAULT_APP_PORT="3000"`}
                </pre>
                <div className="pt-2 text-xs text-stone-400 space-y-1">
                  <p>1. The complete SQL schema is in <code>supabase_schema.sql</code> in the project root.</p>
                  <p>2. Paste it into your Supabase Dashboard SQL Editor to establish Row-Level Security.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decline Deposit Modal */}
      {declineModalDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-stone-950 border border-rose-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-white">Decline Deposit Request</h3>
            <p className="text-xs text-stone-400">
              Ref: <strong className="text-amber-400">{declineModalDeposit.transaction_reference}</strong> ({declineModalDeposit.full_name} - GH₵{declineModalDeposit.amount.toFixed(2)})
            </p>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Reason for Declining (Mandatory)</label>
              <textarea
                rows={3}
                required
                value={declineDepositReason}
                onChange={(e) => setDeclineDepositReason(e.target.value)}
                placeholder="e.g. Reference ID not found on official Telecel statement."
                className="w-full px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-rose-400"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeclineModalDeposit(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !declineDepositReason.trim()}
                onClick={handleDeclineDepositSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Withdrawal Modal */}
      {approveModalWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-stone-950 border border-emerald-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-white">Record Mobile Money Payment</h3>
            <p className="text-xs text-stone-400">
              Send <strong className="text-amber-400">GH₵{approveModalWithdrawal.amount.toFixed(2)}</strong> to {approveModalWithdrawal.network} ({approveModalWithdrawal.mobile_number} - {approveModalWithdrawal.account_holder_name}).
            </p>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Official MoMo Payment Reference ID</label>
              <input
                type="text"
                required
                value={paymentReferenceInput}
                onChange={(e) => setPaymentReferenceInput(e.target.value)}
                placeholder="e.g. TEL-PAID-98218374"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setApproveModalWithdrawal(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !paymentReferenceInput.trim()}
                onClick={handleApproveWithdrawalSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white disabled:opacity-50"
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Withdrawal Modal */}
      {declineModalWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-stone-950 border border-rose-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-white">Decline & Refund Withdrawal</h3>
            <p className="text-xs text-stone-400">
              The amount of <strong className="text-amber-400">GH₵{declineModalWithdrawal.amount.toFixed(2)}</strong> will be refunded to {declineModalWithdrawal.full_name}'s account balance.
            </p>

            <div>
              <label className="text-xs text-stone-300 block mb-1">Reason for Declining</label>
              <textarea
                rows={3}
                required
                value={declineWithdrawalReason}
                onChange={(e) => setDeclineWithdrawalReason(e.target.value)}
                placeholder="e.g. Invalid account holder name for this Mobile Money number."
                className="w-full px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-rose-400"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeclineModalWithdrawal(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !declineWithdrawalReason.trim()}
                onClick={handleDeclineWithdrawalSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-600 text-white disabled:opacity-50"
              >
                Refund & Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-stone-950 border border-emerald-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-white">Edit Livestock Package</h3>
            <form onSubmit={handleSavePackage} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">Package Name</label>
                <input
                  type="text"
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">Contribution (GH₵)</label>
                  <input
                    type="number"
                    value={editingPackage.contribution_amount}
                    onChange={(e) => setEditingPackage({ ...editingPackage, contribution_amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-300 block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    value={editingPackage.duration_hours}
                    onChange={(e) => setEditingPackage({ ...editingPackage, duration_hours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">Min Return (GH₵)</label>
                  <input
                    type="number"
                    step="any"
                    value={editingPackage.projected_return_min}
                    onChange={(e) => setEditingPackage({ ...editingPackage, projected_return_min: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-300 block mb-1">Max Return (GH₵)</label>
                  <input
                    type="number"
                    step="any"
                    value={editingPackage.projected_return_max}
                    onChange={(e) => setEditingPackage({ ...editingPackage, projected_return_max: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Animal Photography URL</label>
                <input
                  type="text"
                  value={editingPackage.image_url}
                  onChange={(e) => setEditingPackage({ ...editingPackage, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPackage.description}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPackage(null)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950"
                >
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
