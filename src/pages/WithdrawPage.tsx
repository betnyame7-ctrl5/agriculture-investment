import React, { useState, useEffect } from 'react';
import { 
  ArrowUpFromLine, Smartphone, AlertCircle, CheckCircle2, 
  Clock, ShieldCheck, RefreshCw, Wallet, FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { Withdrawal } from '../types.ts';

export const WithdrawPage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [minWithdrawal, setMinWithdrawal] = useState(10);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<'TELECEL' | 'MTN'>('TELECEL');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [accountHolderName, setAccountHolderName] = useState(user?.full_name || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getMyWithdrawals();
      setWithdrawals(res.withdrawals || []);
      setMinWithdrawal(res.minWithdrawal || 10);
    } catch (err: any) {
      console.error('Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < minWithdrawal) {
      setError(`Minimum withdrawal is GH₵${minWithdrawal.toFixed(2)}.`);
      return;
    }

    if ((user?.balance || 0) < parsedAmount) {
      setError(`Insufficient available balance! You have GH₵${user?.balance.toFixed(2)}, but requested GH₵${parsedAmount.toFixed(2)}.`);
      return;
    }

    if (!mobileNumber.trim() || mobileNumber.trim().length < 9) {
      setError('Please provide a valid Mobile Money phone number.');
      return;
    }

    if (!accountHolderName.trim()) {
      setError('Please enter the exact registered account holder name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitWithdrawal({
        amount: parsedAmount,
        network,
        mobile_number: mobileNumber.trim(),
        account_holder_name: accountHolderName.trim(),
      });

      setSuccessMsg(res.message);
      setAmount('');
      await loadData();
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700 text-amber-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mobile Money Payout Desk</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mt-1">Withdraw Funds</h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Transfer funds from your available livestock balance to your TELECEL or MTN wallet.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950 border border-emerald-900/60 text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Available Balance</span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              GH₵ {user?.balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Form and Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-2xl space-y-6">
              <div className="border-b border-stone-800 pb-3">
                <h3 className="text-xl font-serif font-bold text-white">Withdrawal Request</h3>
                <p className="text-xs text-stone-400">Enter payout details below for administrative disbursement.</p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Withdrawal Amount (Min GH₵ {minWithdrawal.toFixed(2)})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-mono text-sm font-bold text-amber-400">GH₵</span>
                    <input
                      type="number"
                      step="any"
                      min={minWithdrawal}
                      max={user?.balance || 0}
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 50.00"
                      className="w-full pl-14 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 text-[11px] text-stone-400">
                    <span>Available: GH₵ {user?.balance.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => setAmount((user?.balance || 0).toString())}
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Max All
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Mobile Money Network</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['TELECEL', 'MTN'] as const).map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setNetwork(net)}
                        className={`p-3 rounded-xl border text-center text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          network === net
                            ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                            : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>{net} MoMo</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Mobile Money Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 0507399029"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Account Holder Name (Must match MoMo registration)
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || (user?.balance || 0) < minWithdrawal}
                    className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowUpFromLine className="w-5 h-5" />}
                    <span>{submitting ? 'Placing Request...' : 'Submit Withdrawal Request'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Rules and Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 text-xs text-stone-300">
              <h4 className="text-base font-serif font-bold text-white">Withdrawal Conditions & Rules</h4>
              <ul className="space-y-3 text-stone-400">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant Escrow Hold:</strong> When you place a request, the funds are held securely to prevent duplicate spending.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Administrative Payment:</strong> The administrator executes the actual Mobile Money transfer and inputs the official payment reference number.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Automatic Refund on Decline:</strong> If a request is declined (e.g., incorrect mobile number or unmatched name), the funds are refunded instantly back to your available balance.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Withdrawal History Table */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-white">Withdrawal History</h3>
              <p className="text-xs text-stone-400">Track payouts and recorded Mobile Money payment references</p>
            </div>
            <button onClick={loadData} className="p-1.5 rounded-lg text-stone-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {withdrawals.length === 0 ? (
            <div className="py-8 text-center text-stone-500 text-xs">
              No withdrawal requests recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Network</th>
                    <th className="py-2.5 px-3">Recipient Phone</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Payment Reference / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-900">
                  {withdrawals.map((wth) => (
                    <tr key={wth.id} className="hover:bg-stone-900/50">
                      <td className="py-3 px-3 text-stone-400 font-mono text-[11px]">
                        {new Date(wth.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        GH₵ {wth.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-amber-300">{wth.network}</td>
                      <td className="py-3 px-3 text-stone-300 font-mono">{wth.mobile_number}</td>
                      <td className="py-3 px-3">
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
                      <td className="py-3 px-3 text-stone-300">
                        {wth.status === 'approved' && (
                          <span className="font-mono text-emerald-300 font-semibold">
                            Ref: {wth.payment_reference || 'Completed'}
                          </span>
                        )}
                        {wth.status === 'declined' && (
                          <span className="text-rose-400 italic">
                            Declined: {wth.decline_reason}
                          </span>
                        )}
                        {wth.status === 'pending' && (
                          <span className="text-amber-400/80 italic">Awaiting Admin Payout</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
