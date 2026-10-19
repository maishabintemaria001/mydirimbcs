import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserEntitlement } from '../types/index.js';
import { ApiClient } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  activeEntitlement: UserEntitlement | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<User>;
  register: (payload: { name: string; email: string; password: string; phone?: string; track?: string }) => Promise<User>;
  forgotPassword: (identifier: string) => Promise<{ status: string; message: string; otp?: string; target?: string }>;
  resetPassword: (payload: { identifier: string; otp: string; new_password: string }) => Promise<User>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<User>;
  refreshUser: () => Promise<User | null>;
  getRedirectPathForUser: (user: User | null) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeEntitlement, setActiveEntitlement] = useState<UserEntitlement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getRedirectPathForUser = (targetUser: User | null): string => {
    if (!targetUser) return '/';
    if (targetUser.role === 'admin' || targetUser.role === 'content_manager' || targetUser.role === 'exam_manager') {
      return '/admin';
    }
    return '/dashboard';
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const res = await ApiClient.getMe();
      if (res && res.user) {
        setUser(res.user);
        setActiveEntitlement(res.active_entitlement || null);
        return res.user;
      } else {
        setUser(null);
        setActiveEntitlement(null);
        return null;
      }
    } catch {
      setUser(null);
      setActiveEntitlement(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string): Promise<User> => {
    const res = await ApiClient.login(identifier, pass);
    ApiClient.setToken(res.token);
    setUser(res.user);
    if (res.active_entitlement !== undefined) {
      setActiveEntitlement(res.active_entitlement || null);
    } else {
      await refreshUser();
    }
    return res.user;
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string; track?: string }): Promise<User> => {
    const res = await ApiClient.register(payload);
    ApiClient.setToken(res.token);
    setUser(res.user);
    await refreshUser();
    return res.user;
  };

  const forgotPassword = async (identifier: string) => {
    return await ApiClient.forgotPassword(identifier);
  };

  const resetPassword = async (payload: { identifier: string; otp: string; new_password: string }): Promise<User> => {
    const res = await ApiClient.resetPassword(payload);
    ApiClient.setToken(res.token);
    setUser(res.user);
    await refreshUser();
    return res.user;
  };

  const logout = () => {
    ApiClient.removeToken();
    setUser(null);
    setActiveEntitlement(null);
  };

  const switchRole = async (role: UserRole): Promise<User> => {
    try {
      const res = await ApiClient.switchDemoRole(role);
      ApiClient.setToken(res.token);
      setUser(res.user);
      if (res.active_entitlement !== undefined) {
        setActiveEntitlement(res.active_entitlement || null);
      } else {
        await refreshUser();
      }
      return res.user;
    } catch (e) {
      console.error('Failed to switch role', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      activeEntitlement, 
      loading, 
      login, 
      register, 
      forgotPassword,
      resetPassword,
      logout, 
      switchRole, 
      refreshUser,
      getRedirectPathForUser
    }}>
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
