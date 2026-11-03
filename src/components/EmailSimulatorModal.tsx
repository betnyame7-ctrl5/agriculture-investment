import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, X, ShieldAlert, KeyRound, Clock } from 'lucide-react';
import { api } from '../lib/api.ts';
import { EmailLog } from '../types.ts';

interface EmailSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterEmail?: string;
}

export const EmailSimulatorModal: React.FC<EmailSimulatorModalProps> = ({ isOpen, onClose, filterEmail }) => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getEmailLogs();
      setLogs(res.logs || []);
    } catch (err) {
      // If user is not admin, fallback to safe message
      console.warn('Could not fetch email logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const displayLogs = filterEmail 
    ? logs.filter(l => l.recipient_email.toLowerCase() === filterEmail.toLowerCase())
    : logs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-emerald-800/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 to-stone-900 border-b border-emerald-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-900/60 border border-emerald-700/40 text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-amber-100">Dispatched Email Audit Log</h3>
              <p className="text-xs text-emerald-300/80">Inspection tool for developer & tester email verification codes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/50 transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <p>
              In production, codes are dispatched directly to the user's personal mailbox via SMTP/SES. During development & testing, outgoing verification emails are captured here for fast testing.
            </p>
          </div>

          {displayLogs.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <KeyRound className="w-10 h-10 mx-auto mb-2 text-stone-600" />
              <p className="text-sm font-medium">No dispatched emails recorded yet.</p>
              <p className="text-xs text-stone-500 mt-1">Register an account or request a password reset to see outgoing emails.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-stone-950/70 border border-emerald-900/50 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-700/50">
                        To: {log.recipient_email}
                      </span>
                      <h4 className="text-sm font-medium text-stone-200 mt-1.5">{log.subject}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-stone-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="p-3 mt-2 rounded-lg bg-stone-900/90 border border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 block mb-0.5">
                        5-Digit Verification Code
                      </span>
                      <span className="font-mono text-xl font-bold tracking-widest text-amber-300">
                        {log.code}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(log.code);
                        alert(`Code ${log.code} copied to clipboard!`);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-800/60 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/40 transition-colors"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSimulatorModal;
