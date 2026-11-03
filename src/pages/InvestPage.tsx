import React, { useState, useEffect } from 'react';
import { 
  Layers, Clock, ShieldAlert, ArrowRight, CheckCircle2, 
  Wallet, AlertCircle, RefreshCw, X, Calendar 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { LivestockPackage } from '../types.ts';

interface InvestPageProps {
  setCurrentTab: (tab: string) => void;
  selectedPackage?: LivestockPackage | null;
  onClearSelectedPackage?: () => void;
}

export const InvestPage: React.FC<InvestPageProps> = ({ 
  setCurrentTab, 
  selectedPackage, 
  onClearSelectedPackage 
}) => {
  const { user, refreshUser } = useAuth();

  const [packages, setPackages] = useState<LivestockPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingPackage, setConfirmingPackage] = useState<LivestockPackage | null>(selectedPackage || null);
  const [investing, setInvesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    packageName: string;
    amount: number;
    maturityTime: string;
    newBalance: number;
  } | null>(null);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await api.getPackages();
      setPackages(res.packages || []);
    } catch (err: any) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (selectedPackage) {
      setConfirmingPackage(selectedPackage);
    }
  }, [selectedPackage]);

  const handleInitiateInvest = (pkg: LivestockPackage) => {
    setError(null);
    if (!user) {
      setCurrentTab('login');
      return;
    }

    if (user.balance < pkg.contribution_amount) {
      setError(`Insufficient available balance! You need GH₵${pkg.contribution_amount.toFixed(2)}, but your balance is GH₵${user.balance.toFixed(2)}. Please make a deposit first.`);
      return;
    }

    setConfirmingPackage(pkg);
  };

  const handleConfirmInvestment = async () => {
    if (!confirmingPackage) return;
    setError(null);
    setInvesting(true);

    try {
      const res = await api.invest(confirmingPackage.id);
      await refreshUser();
      setSuccessModalData({
        packageName: confirmingPackage.name,
        amount: confirmingPackage.contribution_amount,
        maturityTime: res.maturityTime,
        newBalance: res.newBalance,
      });
      setConfirmingPackage(null);
      if (onClearSelectedPackage) onClearSelectedPackage();
    } catch (err: any) {
      setError(err.message || 'Failed to process investment allocation.');
    } finally {
      setInvesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                Livestock Agribusiness Program
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-900 text-emerald-300">
                24h Cycle
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Select Livestock Package
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Allocate funds to Dog, Goat, or Cow agricultural husbandry pens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-right">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Available Balance</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                GH₵ {user?.balance.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('deposit')}
              className="px-4 py-3 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-md"
            >
              Add Funds
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-xs text-rose-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-300 font-bold mb-0.5">Allocation Notice</strong>
                <span>{error}</span>
              </div>
            </div>
            {error.includes('Insufficient') && (
              <button
                onClick={() => setCurrentTab('deposit')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900 hover:bg-rose-800 text-white shrink-0"
              >
                Go to Deposit
              </button>
            )}
          </div>
        )}

        {/* Packages Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const hasEnoughBalance = (user?.balance || 0) >= pkg.contribution_amount;

            return (
              <div
                key={pkg.id}
                className="group rounded-3xl overflow-hidden bg-stone-950 border-2 border-emerald-900 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                {/* Animal Photo */}
                <div className="relative h-60 overflow-hidden bg-stone-900">
                  <img
                    src={pkg.image_url}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>

                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-950/90 text-amber-300 border border-amber-500/50">
                    {pkg.animal_type}
                  </span>

                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-950/90 text-stone-200 border border-stone-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{pkg.duration_hours}h Duration</span>
                  </span>

                  <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Contribution</span>
                    <span className="text-3xl font-extrabold text-white font-mono">
                      GH₵ {pkg.contribution_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xl font-serif font-bold text-white">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed font-light">
                      {pkg.description}
                    </p>

                    <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-stone-300">
                        <span className="text-stone-400">Projected Market Return:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          GH₵ {pkg.projected_return_min.toFixed(2)} - GH₵ {pkg.projected_return_max.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-stone-300">
                        <span className="text-stone-400">Biological Risk Mitigation:</span>
                        <span className="text-[11px] text-amber-300">Biosecurity & Quarantine</span>
                      </div>
                    </div>
                  </div>

                  {/* Invest Button */}
                  <div className="pt-3 border-t border-stone-800">
                    <button
                      onClick={() => handleInitiateInvest(pkg)}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                        hasEnoughBalance
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950'
                          : 'bg-emerald-950 text-amber-300 hover:bg-emerald-900 border border-emerald-800'
                      }`}
                    >
                      <span>
                        {hasEnoughBalance
                          ? `Invest GH₵ ${pkg.contribution_amount.toFixed(2)}`
                          : `Top Up & Invest (Need GH₵${pkg.contribution_amount.toFixed(2)})`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-stone-950 border border-emerald-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-900 text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Confirm Livestock Investment</h3>
                  <p className="text-xs text-stone-400">24-hour agricultural production cycle</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmingPackage(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Livestock Package:</span>
                  <span className="font-bold text-white text-sm">{confirmingPackage.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Animal Program:</span>
                  <span className="text-stone-200">{confirmingPackage.animal_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Contribution Deducted:</span>
                  <span className="font-mono font-bold text-amber-400 text-base">
                    GH₵ {confirmingPackage.contribution_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Cycle Duration:</span>
                  <span className="font-mono text-stone-200 font-semibold">{confirmingPackage.duration_hours} Hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Maturity Time:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {new Date(Date.now() + confirmingPackage.duration_hours * 3600 * 1000).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-200 leading-relaxed">
                <strong>Agribusiness Agreement:</strong> I understand this contribution funds active livestock husbandry feeds and veterinary care in Ghana. Proceeds are determined from documented wholesale sales and credited to my balance upon cycle maturity.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingPackage(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={investing}
                onClick={handleConfirmInvestment}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {investing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{investing ? 'Processing Deduction...' : 'Confirm & Allocate Funds'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-stone-950 border border-emerald-700 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-900/80 border border-emerald-600 text-amber-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-serif font-bold text-white">Investment Active!</h3>
            <p className="text-xs text-stone-300">
              Your contribution of <strong className="text-amber-400 font-mono">GH₵ {successModalData.amount.toFixed(2)}</strong> to <strong>{successModalData.packageName}</strong> has been allocated to our farm pen operations.
            </p>

            <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-400">Scheduled Maturity:</span>
                <span className="text-emerald-400 font-bold">{new Date(successModalData.maturityTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">New Available Balance:</span>
                <span className="text-white font-bold">GH₵ {successModalData.newBalance.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSuccessModalData(null);
                  setCurrentTab('history');
                }}
                className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors"
              >
                View in Investment History
              </button>
              <button
                onClick={() => setSuccessModalData(null)}
                className="w-full py-3 rounded-xl font-semibold text-xs bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestPage;
