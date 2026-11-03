/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { api } from './lib/api.ts';
import { LivestockPackage } from './types.ts';

import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import { EmailSimulatorModal } from './components/EmailSimulatorModal.tsx';
import { SupabaseDocsModal } from './components/SupabaseDocsModal.tsx';

import HomePage from './pages/HomePage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import AnimalsPage from './pages/AnimalsPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import DepositPage from './pages/DepositPage.tsx';
import InvestPage from './pages/InvestPage.tsx';
import HistoryPage from './pages/HistoryPage.tsx';
import WithdrawPage from './pages/WithdrawPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import SupportPage from './pages/SupportPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [packages, setPackages] = useState<LivestockPackage[]>([]);
  const [selectedPackageToInvest, setSelectedPackageToInvest] = useState<LivestockPackage | null>(null);

  // Helper modals
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState<boolean>(false);
  const [verifyEmailTarget, setVerifyEmailTarget] = useState<string>('');
  const [registerStep, setRegisterStep] = useState<'register' | 'verify'>('register');

  const handleNavigateToVerify = (emailToVerify: string) => {
    setVerifyEmailTarget(emailToVerify);
    setRegisterStep('verify');
    setCurrentTab('register');
  };

  // Load active packages on boot
  useEffect(() => {
    api.getPackages().then((res) => {
      setPackages(res.packages || []);
    }).catch((err) => {
      console.warn('Could not load packages initially:', err);
    });
  }, []);

  const handleSelectPackageToInvest = (pkg: LivestockPackage) => {
    setSelectedPackageToInvest(pkg);
    if (!user) {
      setCurrentTab('login');
    } else {
      setCurrentTab('invest');
    }
  };

  // Route protection
  const protectedTabs = ['dashboard', 'deposit', 'invest', 'history', 'withdraw', 'notifications', 'support', 'profile'];
  const isAdminTab = currentTab === 'admin';

  let activeView = currentTab;
  if (!loading) {
    if (!user && protectedTabs.includes(currentTab)) {
      activeView = 'login';
    } else if (isAdminTab && user?.role !== 'admin') {
      activeView = user ? 'dashboard' : 'login';
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-stone-950">
      {/* Top Navigation */}
      <Navbar
        currentTab={activeView}
        setCurrentTab={setCurrentTab}
        openEmailModal={() => setEmailModalOpen(true)}
        openSupabaseModal={() => setSupabaseModalOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomePage
            packages={packages}
            setCurrentTab={setCurrentTab}
            onSelectPackageToInvest={handleSelectPackageToInvest}
          />
        )}

        {activeView === 'about' && (
          <AboutPage setCurrentTab={setCurrentTab} />
        )}

        {activeView === 'animals' && (
          <AnimalsPage
            packages={packages}
            onSelectPackageToInvest={handleSelectPackageToInvest}
          />
        )}

        {activeView === 'contact' && (
          <ContactPage setCurrentTab={setCurrentTab} />
        )}

        {activeView === 'register' && (
          <RegisterPage
            setCurrentTab={(tab) => {
              if (tab !== 'register') {
                setRegisterStep('register');
                setVerifyEmailTarget('');
              }
              setCurrentTab(tab);
            }}
            openEmailModal={() => setEmailModalOpen(true)}
            initialEmail={verifyEmailTarget}
            initialStep={registerStep}
          />
        )}

        {activeView === 'login' && (
          <LoginPage
            setCurrentTab={setCurrentTab}
            openEmailModal={() => setEmailModalOpen(true)}
            onNavigateToVerify={handleNavigateToVerify}
          />
        )}

        {activeView === 'dashboard' && (
          <DashboardPage
            setCurrentTab={setCurrentTab}
            onSelectPackageToInvest={handleSelectPackageToInvest}
          />
        )}

        {activeView === 'deposit' && (
          <DepositPage />
        )}

        {activeView === 'invest' && (
          <InvestPage
            setCurrentTab={setCurrentTab}
            selectedPackage={selectedPackageToInvest}
            onClearSelectedPackage={() => setSelectedPackageToInvest(null)}
          />
        )}

        {activeView === 'history' && (
          <HistoryPage setCurrentTab={setCurrentTab} />
        )}

        {activeView === 'withdraw' && (
          <WithdrawPage />
        )}

        {activeView === 'notifications' && (
          <NotificationsPage />
        )}

        {activeView === 'support' && (
          <SupportPage />
        )}

        {activeView === 'profile' && (
          <ProfilePage />
        )}

        {activeView === 'admin' && (
          <AdminDashboardPage />
        )}
      </main>

      {/* Footer */}
      <Footer
        setCurrentTab={setCurrentTab}
        openSupabaseModal={() => setSupabaseModalOpen(true)}
      />

      {/* Inspection Modals */}
      <EmailSimulatorModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        filterEmail={verifyEmailTarget || user?.email}
      />

      <SupabaseDocsModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
