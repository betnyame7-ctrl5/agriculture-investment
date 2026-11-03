import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserMetrics } from '../types.ts';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../lib/api.ts';

interface AuthContextType {
  user: UserProfile | null;
  metrics: UserMetrics | null;
  token: string | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<{ email: string }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => void;
  unreadCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUser = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setMetrics(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
      setMetrics(res.metrics);
      setUnreadCount(res.metrics.unreadNotifications);
    } catch (err) {
      console.error('Failed to load user session:', err);
      clearStoredToken();
      setToken(null);
      setUser(null);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Poll notifications and balance periodically when logged in
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshUser();
    }, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const login = async (credentials: any) => {
    const res = await api.login(credentials);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    return { email: res.email };
  };

  const verifyEmail = async (email: string, code: string) => {
    const res = await api.verifyEmail({ email, code });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setMetrics(null);
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        metrics,
        token,
        loading,
        refreshUser,
        login,
        register,
        verifyEmail,
        logout,
        unreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
