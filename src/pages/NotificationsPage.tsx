import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, RefreshCw, Layers, ArrowDownToLine, ArrowUpFromLine, MessageSquare, Info, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { NotificationItem } from '../types.ts';

export const NotificationsPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getMyNotifications();
      setNotifications(res.notifications || []);
      await refreshUser();
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      await refreshUser();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      await refreshUser();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownToLine className="w-4 h-4 text-emerald-400" />;
      case 'withdrawal':
        return <ArrowUpFromLine className="w-4 h-4 text-amber-400" />;
      case 'investment':
        return <Layers className="w-4 h-4 text-emerald-300" />;
      case 'support':
        return <MessageSquare className="w-4 h-4 text-amber-300" />;
      default:
        return <Info className="w-4 h-4 text-stone-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-900 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">Notifications Inbox</h1>
              <p className="text-xs text-stone-400">Alerts for deposits, livestock investments, and withdrawals</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadNotifications}
              className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-stone-950 border border-stone-800 text-center space-y-2 text-stone-400">
            <Bell className="w-10 h-10 mx-auto text-stone-600 mb-2" />
            <p className="text-sm font-medium">No notifications yet.</p>
            <p className="text-xs text-stone-500">You will receive notifications when you make deposits, investments, or withdrawals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && handleMarkSingleRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  notif.is_read
                    ? 'bg-stone-950/70 border-stone-800 text-stone-400'
                    : 'bg-stone-950 border-emerald-700/80 shadow-md text-stone-200'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  notif.is_read ? 'bg-stone-900 text-stone-500' : 'bg-emerald-900/60'
                }`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold ${notif.is_read ? 'text-stone-300' : 'text-white'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[11px] font-mono text-stone-500">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.is_read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-2"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
