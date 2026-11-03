import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface ContactPageProps {
  setCurrentTab: (tab: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ setCurrentTab }) => {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
            Get in Touch
          </span>
          <h1 className="text-4xl font-serif font-extrabold text-white">
            Contact Agriculture Investment
          </h1>
          <p className="text-sm text-stone-400 font-light">
            We are here to support your questions regarding livestock packages, Mobile Money deposit confirmations, and veterinary operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-lg space-y-4">
              <h3 className="text-lg font-serif font-bold text-white">Official Office & Agro-Hub</h3>

              <div className="space-y-4 text-xs text-stone-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-900/60 text-amber-400 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Headquarters:</strong>
                    <span>Agro-Hub Complex, Sunyani Road, Kumasi, Ashanti Region, Ghana</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-900/60 text-amber-400 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Official Phone & MoMo Support:</strong>
                    <span className="font-mono text-amber-300">+233 50 739 9029</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-900/60 text-amber-400 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Email Dispatch:</strong>
                    <span>support@agricultureinvestment.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-900/60 text-amber-400 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Operational Hours:</strong>
                    <span>Monday – Saturday: 7:00 AM – 7:00 PM GMT</span>
                  </div>
                </div>
              </div>
            </div>

            {user && (
              <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-xs text-stone-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>Real-time Live Chat</span>
                </div>
                <p className="text-stone-300">
                  As an authenticated member, you have access to live administrative support with instant replies directly in your account.
                </p>
                <button
                  onClick={() => setCurrentTab('support')}
                  className="mt-2 w-full py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors"
                >
                  Open Live Support Desk
                </button>
              </div>
            )}
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-stone-950 border border-emerald-900/60 shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-900/80 border border-emerald-600 text-amber-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">Inquiry Received</h3>
                  <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
                    Thank you, {name}. A member of our livestock farm operations team will review your message and reply via email shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="mt-4 px-6 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-serif font-bold text-white mb-2">Send us a Message</h3>

                  <div>
                    <label className="text-xs font-medium text-stone-300 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ama Serwaa"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ama@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-300 block mb-1">Your Message</label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can our farm management team assist you today?"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
