import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, RefreshCw, Shield, User, Clock, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { SupportMessage } from '../types.ts';

export const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const res = await api.getMyMessages();
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      await api.sendSupportMessage(text);
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
      setInputMessage(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-900 text-amber-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">Live Support Desk</h1>
              <p className="text-xs text-stone-400">
                Direct communication with farm administrators & operations managers
              </p>
            </div>
          </div>
          <button
            onClick={loadMessages}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Chat Thread Container */}
        <div className="rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-2xl flex flex-col h-[650px] overflow-hidden">
          {/* Thread Header */}
          <div className="px-6 py-3 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-stone-300">Agricultural Support Desk Online</span>
            </div>
            <span className="text-stone-500 font-mono text-[11px]">
              Response time: Usually within 15 minutes
            </span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950 text-amber-400 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Start a Conversation</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Ask about your deposits, livestock cycles, withdrawal status, or physical farm inspections.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.sender_role === 'admin';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-stone-400">
                      {isAdmin ? (
                        <>
                          <Shield className="w-3 h-3 text-amber-400" />
                          <span className="font-bold text-amber-300">Agriculture Support Desk</span>
                        </>
                      ) : (
                        <>
                          <span className="text-stone-300 font-medium">You</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-mono text-[10px] text-stone-500">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[80%] sm:max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                        isAdmin
                          ? 'bg-emerald-950/90 text-stone-200 border border-emerald-800/80 rounded-tl-sm'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-medium rounded-tr-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-4 bg-stone-900 border-t border-stone-800 flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message to support..."
              className="flex-1 px-4 py-3 rounded-2xl bg-stone-950 border border-stone-800 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="p-3.5 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors shadow-md disabled:opacity-40"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
