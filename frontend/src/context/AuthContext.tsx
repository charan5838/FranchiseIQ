import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  loginDemoInvestor: () => Promise<void>;
  loginDemoAdmin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('franchiseiq_token');
    if (token) {
      api.getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('franchiseiq_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    await api.login(email, pass);
    const me = await api.getMe();
    setUser(me);
  };

  const register = async (name: string, email: string, pass: string) => {
    await api.register(name, email, pass);
    const me = await api.getMe();
    setUser(me);
  };

  const loginDemoInvestor = async () => {
    await api.loginDemoInvestor();
    const me = await api.getMe();
    setUser(me);
  };

  const loginDemoAdmin = async () => {
    await api.loginDemoAdmin();
    const me = await api.getMe();
    setUser(me);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginDemoInvestor, loginDemoAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
