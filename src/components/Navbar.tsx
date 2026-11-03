import React, { useState } from 'react';
import { 
  Menu, X, Wallet, Bell, MessageSquare, Shield, LogOut, 
  User, ArrowRight, HelpCircle, Mail, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import Logo from './Logo.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openEmailModal: () => void;
  openSupabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  openEmailModal, 
  openSupabaseModal 
}) => {
  const { user, metrics, logout, unreadCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'animals', label: 'Animals' },
    { id: 'contact', label: 'Contact' },
  ];

  const authLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'deposit', label: 'Deposit' },
    { id: 'invest', label: 'Invest' },
    { id: 'history', label: 'History' },
    { id: 'withdraw', label: 'Withdraw' },
    { id: 'support', label: 'Live Support' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/60 text-white shadow-lg">
      {/* Top Banner - Security & Quick Helper */}
      <div className="bg-emerald-900/60 border-b border-emerald-800/40 text-[11px] text-emerald-200 py-1 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ghana Licensed Cooperative Livestock Farming & Mobile Money Processing</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={openEmailModal}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 font-medium"
              title="Inspect dispatched email verification codes"
            >
              <Mail className="w-3 h-3 text-amber-400" />
              <span>Email Codes Inspector</span>
            </button>
            <button
              onClick={openSupabaseModal}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 font-medium hidden sm:flex"
            >
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>Supabase Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button 
            onClick={() => handleNav('home')}
            className="flex items-center text-left focus:outline-none"
          >
            <Logo size="md" variant="light" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === item.id
                    ? 'text-amber-400 bg-emerald-900/80'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-900/40'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user && authLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === item.id
                    ? 'text-amber-400 bg-emerald-900/80'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-900/40'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  currentTab === 'admin'
                    ? 'bg-amber-500 text-emerald-950 shadow-md'
                    : 'text-amber-300 hover:bg-amber-500/20 border border-amber-400/40'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Available Balance Pill */}
                <button
                  onClick={() => handleNav('deposit')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/90 border border-amber-400/50 text-white shadow-sm hover:border-amber-400 transition-all"
                  title="Click to Deposit"
                >
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-emerald-200 font-medium">Balance:</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">
                    GH₵ {metrics ? metrics.availableBalance.toFixed(2) : user.balance.toFixed(2)}
                  </span>
                </button>

                {/* Notifications Bell */}
                <button
                  onClick={() => handleNav('notifications')}
                  className="relative p-2 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-900/60 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Link */}
                <button
                  onClick={() => handleNav('profile')}
                  className={`p-2 rounded-full transition-colors ${
                    currentTab === 'profile' ? 'bg-emerald-800 text-amber-400' : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60'
                  }`}
                  title="My Profile"
                >
                  <User className="w-5 h-5" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    handleNav('home');
                  }}
                  className="p-2 rounded-full text-emerald-300 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleNav('login')}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-emerald-100 hover:text-white hover:bg-emerald-900/60 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {user && (
              <button
                onClick={() => handleNav('deposit')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900 text-xs font-mono font-bold text-amber-300 border border-amber-400/40"
              >
                GH₵{metrics ? metrics.availableBalance.toFixed(0) : user.balance.toFixed(0)}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950 border-b border-emerald-800 px-4 pt-2 pb-6 space-y-2">
          {user && (
            <div className="p-3 mb-3 rounded-xl bg-emerald-900/60 border border-emerald-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-300">Logged in as</p>
                <p className="text-sm font-bold text-white">{user.full_name}</p>
                <p className="text-xs font-mono text-amber-400">GH₵ {metrics ? metrics.availableBalance.toFixed(2) : user.balance.toFixed(2)}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500 text-stone-950">
                {user.role}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 pb-2">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-2 rounded-lg text-left text-sm font-medium ${
                  currentTab === item.id ? 'bg-amber-500 text-stone-950 font-bold' : 'text-emerald-100 hover:bg-emerald-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {user && (
            <div className="border-t border-emerald-800/60 pt-2 space-y-1">
              <p className="text-[11px] uppercase font-bold text-emerald-400/80 px-2">Account Services</p>
              <div className="grid grid-cols-2 gap-1.5">
                {authLinks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`px-3 py-2 rounded-lg text-left text-sm font-medium ${
                      currentTab === item.id ? 'bg-emerald-800 text-amber-400 font-bold' : 'text-emerald-100 hover:bg-emerald-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => handleNav('notifications')}
                  className="px-3 py-2 rounded-lg text-left text-sm font-medium text-emerald-100 hover:bg-emerald-900 flex items-center justify-between"
                >
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-stone-950 font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleNav('profile')}
                  className="px-3 py-2 rounded-lg text-left text-sm font-medium text-emerald-100 hover:bg-emerald-900"
                >
                  My Profile
                </button>
              </div>

              {user.role === 'admin' && (
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full mt-2 px-3 py-2 rounded-lg text-center text-sm font-bold bg-amber-500 text-stone-950 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  handleNav('home');
                }}
                className="w-full mt-2 px-3 py-2 rounded-lg text-center text-sm font-medium text-rose-300 hover:bg-rose-950/40 border border-rose-800/40"
              >
                Sign Out
              </button>
            </div>
          )}

          {!user && (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleNav('login')}
                className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-emerald-900 text-emerald-100"
              >
                Login to Account
              </button>
              <button
                onClick={() => handleNav('register')}
                className="w-full py-2.5 rounded-xl text-center text-sm font-bold bg-amber-500 text-stone-950"
              >
                Register & Verify (Get Started)
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
