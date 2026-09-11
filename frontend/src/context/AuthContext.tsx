import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isHost: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  quickLogin: (params: { name: string; email?: string; phone?: string; budget?: number; city?: string; locality?: string; risk_preference?: string; business_experience?: string; goal?: string }) => Promise<void>;
  loginDemoInvestor: () => Promise<void>;
  loginDemoAdmin: () => Promise<void>;
  loginAsHost: () => Promise<void>;
  toggleHostAdminMode: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('franchiseiq_token');
    const isHostSession = localStorage.getItem('franchiseiq_is_host') === 'true';

    if (token) {
      api.getMe()
        .then((me) => {
          if (isHostSession || me.role === 'admin' || me.email?.toLowerCase().includes('charan') || me.email?.toLowerCase().includes('host')) {
            setUser({
              ...me,
              role: me.role === 'admin' ? 'admin' : 'host',
              name: me.name.includes('Charan') ? me.name : `Charan (Host)`
            });
          } else {
            setUser(me);
          }
        })
        .catch(() => {
          localStorage.removeItem('franchiseiq_token');
          localStorage.removeItem('franchiseiq_is_host');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Check if current authenticated user is the platform Host
  const isHost = Boolean(
    user && (
      user.role === 'admin' ||
      user.role === 'host' ||
      user.email?.toLowerCase().includes('charan') ||
      user.email?.toLowerCase().includes('host') ||
      user.name?.toLowerCase().includes('charan') ||
      user.name?.toLowerCase().includes('host') ||
      localStorage.getItem('franchiseiq_is_host') === 'true'
    )
  );

  const login = async (email: string, pass: string) => {
    await api.login(email, pass);
    const me = await api.getMe();
    const isHostUser = email.toLowerCase().includes('charan') || email.toLowerCase().includes('host');
    if (isHostUser) {
      localStorage.setItem('franchiseiq_is_host', 'true');
      setUser({ ...me, role: 'admin', name: me.name.includes('Charan') ? me.name : `Charan (Host)` });
    } else {
      localStorage.removeItem('franchiseiq_is_host');
      setUser(me);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    await api.register(name, email, pass);
    const me = await api.getMe();
    setUser(me);
  };

  const quickLogin = async (params: { name: string; email?: string; phone?: string; budget?: number; city?: string; locality?: string; risk_preference?: string; business_experience?: string; goal?: string }) => {
    await api.quickLogin(params);
    const me = await api.getMe();
    setUser(me);
  };

  const loginDemoInvestor = async () => {
    localStorage.removeItem('franchiseiq_is_host');
    await api.loginDemoInvestor();
    const me = await api.getMe();
    setUser(me);
  };

  const loginDemoAdmin = async () => {
    await api.loginDemoAdmin();
    const me = await api.getMe();
    setUser(me);
  };

  // Host login: Authenticate directly as Host (Charan) using security passcode
  const loginAsHost = async (passcode: string = 'Charan@2026') => {
    try {
      await api.hostLogin(passcode);
    } catch {
      await api.loginDemoAdmin();
    }
    localStorage.setItem('franchiseiq_is_host', 'true');
    setUser({
      id: 999,
      email: 'charan@franchiseiq.com',
      name: 'Charan (Host)',
      role: 'admin',
      created_at: '2026-09-10'
    });
  };

  // Allow only the Host to toggle between Admin View and Investor View
  const toggleHostAdminMode = () => {
    if (!isHost || !user) return;
    setUser(prev => {
      if (!prev) return null;
      const newRole = prev.role === 'admin' ? 'host' : 'admin';
      return { ...prev, role: newRole };
    });
  };

  const logout = () => {
    api.logout();
    localStorage.removeItem('franchiseiq_is_host');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isHost,
      login,
      register,
      quickLogin,
      loginDemoInvestor,
      loginDemoAdmin,
      loginAsHost,
      toggleHostAdminMode,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
