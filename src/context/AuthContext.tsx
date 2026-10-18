import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserEntitlement } from '../types/index.js';
import { ApiClient } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  activeEntitlement: UserEntitlement | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeEntitlement, setActiveEntitlement] = useState<UserEntitlement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await ApiClient.getMe();
      if (res && res.user) {
        setUser(res.user);
        setActiveEntitlement(res.active_entitlement || null);
      } else {
        setUser(null);
        setActiveEntitlement(null);
      }
    } catch {
      setUser(null);
      setActiveEntitlement(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await ApiClient.login(email, pass);
    ApiClient.setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const res = await ApiClient.register(payload);
    ApiClient.setToken(res.token);
    setUser(res.user);
    await refreshUser();
  };

  const logout = () => {
    ApiClient.removeToken();
    setUser(null);
    setActiveEntitlement(null);
  };

  const switchRole = async (role: UserRole) => {
    try {
      const res = await ApiClient.switchDemoRole(role);
      ApiClient.setToken(res.token);
      setUser(res.user);
      await refreshUser();
    } catch (e) {
      console.error('Failed to switch role', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, activeEntitlement, loading, login, register, logout, switchRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
