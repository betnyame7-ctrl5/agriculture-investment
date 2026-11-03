import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, 
  Clock, ShieldCheck, ChevronRight, AlertCircle, RefreshCw, 
  Layers, Bell, MessageSquare, ArrowRight, DollarSign 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { TransactionLedger, Investment, Deposit } from '../types.ts';

interface DashboardPageProps {
  setCurrentTab: (tab: string) => void;
  onSelectPackageToInvest: (pkg: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentTab, onSelectPackageToInvest }) => {
  const { user, metrics, refreshUser, logout } = useAuth();

  const [transactions, setTransactions] = useState<TransactionLedger[]>([]);
  const [activeInvestments, setActiveInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      await refreshUser();
      const [txRes, invRes] = await Promise.all([
        api.getMyTransactions(),
        api.getMyInvestments(),
      ]);
      setTransactions(txRes.transactions || []);
      setActiveInvestments((invRes.investments || []).filter(i => i.status === 'active'));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-stone-950 to-stone-900 border border-emerald-800/60 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                Verified Livestock Investor
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-900 text-emerald-300 border border-emerald-700/50">
                Active Member
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Account ID: <span className="font-mono text-stone-300">{user?.id}</span> • Ghana Agribusiness Registry
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors"
              title="Refresh real-time data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setCurrentTab('deposit')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-md flex items-center gap-1.5"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Make Deposit</span>
            </button>
            <button
              onClick={() => setCurrentTab('withdraw')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-900/80 hover:bg-emerald-800 text-white border border-emerald-700 transition-all flex items-center gap-1.5"
            >
              <ArrowUpFromLine className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* 6 Real Database Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* 1. Available Balance */}
          <div className="p-5 rounded-2xl bg-stone-950 border-2 border-amber-400/60 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Available Balance
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
              GH₵ {metrics ? metrics.availableBalance.toFixed(2) : user?.balance.toFixed(2)}
            </div>
            <p className="text-[10px] text-stone-400 mt-2">Ready for livestock allocation or withdrawal</p>
          </div>

          {/* 2. Total Confirmed Deposits */}
          <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-900/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Confirmed Deposits
              </span>
              <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-400">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
            </div>
            <div className="font-mono text-2xl font-bold text-emerald-300">
              GH₵ {metrics ? metrics.totalConfirmedDeposits.toFixed(2) : '0.00'}
            </div>
            <p className="text-[10px] text-stone-400 mt-2">Verified via Telecel Mobile Money</p>
          </div>

          {/* 3. Active Investments */}
          <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-900/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Active Livestock Cycles
              </span>
              <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">
                {metrics ? metrics.activeInvestmentsCount : 0}
              </span>
              <span className="text-xs text-stone-400">
                (GH₵ {metrics ? metrics.activeInvestmentsPrincipal.toFixed(2) : '0.00'})
              </span>
            </div>
            <p className="text-[10px] text-stone-400 mt-2">Currently running in farm pens</p>
          </div>

          {/* 4. Actual Earnings */}
          <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-900/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Documented Earnings
              </span>
              <div className="p-2 rounded-lg bg-emerald-900/40 text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="font-mono text-2xl font-bold text-amber-300">
              GH₵ {metrics ? metrics.totalEarnings.toFixed(2) : '0.00'}
            </div>
            <p className="text-[10px] text-stone-400 mt-2">Total yield from concluded farm cycles</p>
          </div>

          {/* 5. Total Withdrawals */}
          <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-900/80 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Total Withdrawals
              </span>
              <div className="p-2 rounded-lg bg-emerald-900/40 text-rose-400">
                <ArrowUpFromLine className="w-5 h-5" />
              </div>
            </div>
            <div className="font-mono text-2xl font-bold text-stone-200">
              GH₵ {metrics ? metrics.totalWithdrawals.toFixed(2) : '0.00'}
            </div>
            <p className="text-[10px] text-stone-400 mt-2">Paid out to your Mobile Money number</p>
          </div>
        </div>

        {/* Active Cycles Banner (if any) */}
        {activeInvestments.length > 0 && (
          <div className="p-6 rounded-3xl bg-emerald-950/50 border border-emerald-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Active 24-Hour Livestock Cycles Running</h3>
              </div>
              <button
                onClick={() => setCurrentTab('history')}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View Timer & Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeInvestments.map((inv) => (
                <div key={inv.id} className="p-4 rounded-xl bg-stone-950 border border-emerald-900/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{inv.package_name}</h4>
                    <span className="text-xs font-mono text-amber-400">Allocated: GH₵ {inv.contribution_amount.toFixed(2)}</span>
                    <span className="text-[11px] text-stone-400 block">
                      Matures: {new Date(inv.maturity_time).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-900 text-emerald-300 border border-emerald-700 animate-pulse">
                    Active Cycle
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Navigation Hub */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-xl space-y-4">
          <h3 className="text-base font-serif font-bold text-white">Quick Navigation Hub</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Wallet },
              { id: 'deposit', label: 'Deposit', icon: ArrowDownToLine },
              { id: 'invest', label: 'Invest', icon: Layers },
              { id: 'history', label: 'History', icon: Clock },
              { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
              { id: 'notifications', label: 'Alerts', icon: Bell },
              { id: 'support', label: 'Support', icon: MessageSquare },
              { id: 'profile', label: 'Profile', icon: ShieldCheck },
            ].map((nav) => {
              const Icon = nav.icon;
              return (
                <button
                  key={nav.id}
                  onClick={() => setCurrentTab(nav.id)}
                  className="p-3.5 rounded-2xl bg-stone-900 hover:bg-emerald-950 hover:border-amber-400/50 border border-stone-800 transition-all text-center flex flex-col items-center gap-2 group"
                >
                  <Icon className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-stone-300 group-hover:text-white">
                    {nav.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions Immutable Ledger */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-white">Audit Transaction Ledger</h3>
              <p className="text-xs text-stone-400">Strict double-entry accounting records from the live database</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">
              {transactions.length} Recorded Entries
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <DollarSign className="w-10 h-10 mx-auto mb-2 text-stone-600" />
              <p className="text-sm font-medium">No transactions recorded yet.</p>
              <p className="text-xs text-stone-500 mt-1">Make your first deposit to fund your livestock account.</p>
              <button
                onClick={() => setCurrentTab('deposit')}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950"
              >
                Deposit Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-right">Balance After</th>
                    <th className="py-3 px-3 text-right">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-900">
                  {transactions.slice(0, 8).map((tx) => {
                    const isPositive = ['deposit', 'investment_payout', 'withdrawal_refund'].includes(tx.type);
                    return (
                      <tr key={tx.id} className="hover:bg-stone-900/50 transition-colors">
                        <td className="py-3 px-3 font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                            isPositive
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-stone-300 max-w-xs truncate">{tx.description}</td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isPositive ? '+' : '-'}GH₵ {tx.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-stone-300">
                          GH₵ {tx.balance_after.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right text-stone-400 font-mono text-[11px]">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
