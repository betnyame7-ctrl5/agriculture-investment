import React, { useState, useEffect } from 'react';
import { 
  ArrowDownToLine, Smartphone, Copy, Check, ShieldCheck, 
  Upload, AlertCircle, CheckCircle2, Clock, RefreshCw, FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { Deposit, SiteSettings } from '../types.ts';

export const DepositPage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [amount, setAmount] = useState('15');
  const [reference, setReference] = useState('');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [network, setNetwork] = useState('TELECEL');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getDepositInfo();
      setSettings(res.settings);
      setDeposits(res.deposits || []);
    } catch (err: any) {
      console.error('Failed to load deposit details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyNumber = () => {
    const num = settings?.momo_number || '0507399029';
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Proof image size should be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const parsedAmount = parseFloat(amount);
    const minDep = settings?.min_deposit || 10;

    if (isNaN(parsedAmount) || parsedAmount < minDep) {
      setError(`Minimum deposit amount is GH₵${minDep.toFixed(2)}.`);
      return;
    }

    if (!reference.trim()) {
      setError('Please provide the transaction reference ID from your Mobile Money SMS.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitDeposit({
        amount: parsedAmount,
        transaction_reference: reference.trim(),
        mobile_number: mobileNumber,
        network: network,
        proof_image_url: proofImage || undefined,
      });

      setSuccessMsg(res.message);
      setReference('');
      setProofImage(null);
      await loadData();
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to submit deposit.');
    } finally {
      setSubmitting(false);
    }
  };

  const minDeposit = settings?.min_deposit || 10.0;
  const momoNumber = settings?.momo_number || '0507399029';
  const momoName = settings?.momo_account_name || 'JOYCE ASABEA';
  const momoNetwork = settings?.momo_network || 'TELECEL';

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700 text-amber-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Telecel MoMo Channel</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mt-1">Deposit Funds</h1>
            <p className="text-xs sm:text-sm text-stone-400">
              Transfer funds via Mobile Money, enter reference ID, and submit for verification.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Available Balance</span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              GH₵ {user?.balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Official Instructions */}
          <div className="lg:col-span-5 space-y-6">
            {/* MoMo Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-stone-950 to-stone-900 border-2 border-emerald-700/70 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Mobile Money Payment Details
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950">
                  Official Recipient
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block font-bold">Network</span>
                    <span className="text-base font-bold text-white font-mono">{momoNetwork}</span>
                  </div>
                  <Smartphone className="w-5 h-5 text-amber-400" />
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block font-bold">MoMo Number</span>
                    <span className="text-xl font-bold text-amber-300 font-mono tracking-wider">{momoNumber}</span>
                  </div>
                  <button
                    onClick={handleCopyNumber}
                    className="p-2 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 transition-colors"
                    title="Copy phone number"
                  >
                    {copiedNumber ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 block font-bold">Account Holder Name</span>
                    <span className="text-base font-bold text-white uppercase">{momoName}</span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-200/90 space-y-1">
                <strong>Important MoMo Verification Notice:</strong>
                <p>
                  Confirm that the account name displays <strong>{momoName}</strong> on your phone screen before entering your Mobile Money PIN.
                </p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-3 text-xs text-stone-300">
              <h4 className="text-sm font-bold text-white font-serif">4 Steps to Complete Deposit</h4>
              <ol className="space-y-2 list-decimal list-inside text-stone-400">
                <li>Dial your Mobile Money code (e.g. *110# for Telecel or *170# for MTN).</li>
                <li>Choose Send Money and transfer to <strong>{momoNumber} ({momoName})</strong>.</li>
                <li>Wait for the confirmation SMS containing the <strong>Transaction Reference ID</strong>.</li>
                <li>Enter the reference ID in the form and click <strong>I HAVE PAID</strong>.</li>
              </ol>
              <p className="text-[11px] text-emerald-400/90 pt-2 border-t border-stone-800">
                Minimum Deposit: GH₵ {minDeposit.toFixed(2)}. Deposits are credited upon administrative verification.
              </p>
            </div>
          </div>

          {/* Right Column: "I Have Paid" Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-8 rounded-3xl bg-stone-950 border border-emerald-900/70 shadow-2xl space-y-6">
              <div className="border-b border-stone-800 pb-3">
                <h3 className="text-xl font-serif font-bold text-white">Submit Deposit Confirmation</h3>
                <p className="text-xs text-stone-400">Provide transaction reference to notify the administrator.</p>
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

              <form onSubmit={handleSubmitDeposit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Deposit Amount (Minimum GH₵ {minDeposit.toFixed(2)})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-mono text-sm font-bold text-amber-400">GH₵</span>
                    <input
                      type="number"
                      min={minDeposit}
                      step="any"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="15.00"
                      className="w-full pl-14 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  {/* Preset quick buttons */}
                  <div className="flex gap-2 mt-2">
                    {[15, 40, 80, 100, 200].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toString())}
                        className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium border ${
                          amount === val.toString()
                            ? 'bg-amber-500 text-stone-950 border-amber-400'
                            : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        GH₵{val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Network Paid From</label>
                    <select
                      value={network}
                      onChange={(e) => setNetwork(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="TELECEL">TELECEL Mobile Money</option>
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="AIRTELTIGO">AT Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Your Mobile Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 0244123456"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Mobile Money Transaction Reference ID <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. 19827364501 or TEL-20261103"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border-2 border-emerald-800 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400 uppercase"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Check your Mobile Money SMS for the Reference ID or Transaction ID.
                  </p>
                </div>

                {/* Evidence Upload */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Payment Evidence / Screenshot Receipt (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs text-stone-300 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Choose Receipt Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {proofImage && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Receipt Attached
                      </span>
                    )}
                  </div>
                  {proofImage && (
                    <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-emerald-700">
                      <img src={proofImage} alt="Receipt proof" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    <span>{submitting ? 'Submitting Request...' : 'I HAVE PAID'}</span>
                  </button>
                  <p className="text-[10px] text-center text-stone-500 mt-2">
                    Security Policy: Duplicate references are rejected. The administrator verifies the official statement before crediting.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Deposit History */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold text-white">Your Submitted Deposits</h3>
              <p className="text-xs text-stone-400">Track pending and approved Mobile Money payments</p>
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {deposits.length === 0 ? (
            <div className="py-8 text-center text-stone-500 text-xs">
              No deposit submissions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Network</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Admin Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-900">
                  {deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-stone-900/50">
                      <td className="py-3 px-3 text-stone-400 font-mono text-[11px]">
                        {new Date(dep.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        GH₵ {dep.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-300">
                        {dep.transaction_reference}
                      </td>
                      <td className="py-3 px-3 text-stone-300">{dep.network}</td>
                      <td className="py-3 px-3">
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
                      <td className="py-3 px-3 text-stone-400 italic">
                        {dep.admin_notes || (dep.status === 'pending' ? 'Pending verification' : 'None')}
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

export default DepositPage;
