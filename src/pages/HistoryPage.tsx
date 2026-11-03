import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, 
  Layers, ArrowRight, Calendar, DollarSign 
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { Investment } from '../types.ts';

interface HistoryPageProps {
  setCurrentTab: (tab: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ setCurrentTab }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getMyInvestments();
      setInvestments(res.investments || []);
    } catch (err) {
      console.error('Failed to load investment history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // Auto refresh every 20 seconds to update cycle status
    const interval = setInterval(loadHistory, 20000);
    return () => clearInterval(interval);
  }, []);

  const filtered = investments.filter((inv) => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700 text-amber-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Real-Time Livestock Cycles</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mt-1">Investment History</h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Audit log of active and matured livestock agricultural contributions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadHistory}
              disabled={loading}
              className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setCurrentTab('invest')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>New Investment</span>
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 border-b border-stone-800 pb-2">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === tab
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-950 text-stone-400 hover:text-white'
              }`}
            >
              {tab} ({investments.filter(i => tab === 'all' ? true : i.status === tab).length})
            </button>
          ))}
        </div>

        {/* Investments Cards & Table */}
        {filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-stone-950 border border-stone-800 text-center space-y-3">
            <Clock className="w-12 h-12 text-stone-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No {filter} investments found</h3>
            <p className="text-xs text-stone-400">
              You haven't participated in any livestock packages under this filter yet.
            </p>
            <button
              onClick={() => setCurrentTab('invest')}
              className="mt-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white"
            >
              Choose a Livestock Package
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((inv) => {
              const now = new Date();
              const maturity = new Date(inv.maturity_time);
              const isPast = now >= maturity;
              const remainingMs = maturity.getTime() - now.getTime();
              const remainingHrs = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
              const remainingMins = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)));

              return (
                <div
                  key={inv.id}
                  className="p-6 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-amber-400 font-bold">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400">
                          {inv.animal_type || 'Livestock Agribusiness'}
                        </span>
                        <h3 className="text-lg font-serif font-bold text-white">
                          {inv.package_name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        inv.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : inv.status === 'active'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-stone-400 block mb-0.5">Contribution Principal</span>
                      <span className="text-base font-bold font-mono text-white">
                        GH₵ {inv.contribution_amount.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-stone-400 block mb-0.5">
                        {inv.status === 'completed' ? 'Actual Yield Credited' : 'Projected Return'}
                      </span>
                      <span className="text-base font-bold font-mono text-emerald-400">
                        GH₵ {inv.status === 'completed' ? inv.actual_return.toFixed(2) : inv.projected_return.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-stone-400 block mb-0.5">Cycle Start Time</span>
                      <span className="text-stone-300 font-mono text-[11px]">
                        {new Date(inv.start_time).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="text-stone-400 block mb-0.5">Scheduled Maturity</span>
                      <span className="text-stone-300 font-mono text-[11px]">
                        {new Date(inv.maturity_time).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Active Cycle Countdown Bar */}
                  {inv.status === 'active' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-amber-400 font-medium">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>
                          {isPast 
                            ? 'Maturity reached! Payout processing...' 
                            : `Cycle Time Remaining: ${remainingHrs}h ${remainingMins}m`}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        Principal + Documented harvest yield will be credited automatically.
                      </span>
                    </div>
                  )}

                  {/* Completed Yield Notes */}
                  {inv.status === 'completed' && inv.business_yield_notes && (
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{inv.business_yield_notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
