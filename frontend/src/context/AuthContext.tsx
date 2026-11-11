import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerPatient: (data: any) => Promise<void>;
  registerDoctor: (data: any) => Promise<void>;
  logout: () => void;
  switchRoleDemo: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  isPatient: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.getCurrentUser();
      setUser(res.user);
    } catch (err) {
      console.warn('Failed to fetch current user:', err);
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setAuthToken(res.token);
    setUser(res.user);
  };

  const registerPatient = async (data: any) => {
    const res = await api.registerPatient(data);
    setAuthToken(res.token);
    setUser(res.user);
  };

  const registerDoctor = async (data: any) => {
    const res = await api.registerDoctor(data);
    setAuthToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const switchRoleDemo = async (role: UserRole) => {
    let email = 'patient@urcure.com';
    let password = 'PatientPass123!';

    if (role === 'doctor') {
      email = 'dr.sharma@urcure.com';
      password = 'DoctorPass123!';
    } else if (role === 'admin') {
      email = 'admin@urcure.com';
      password = 'AdminPass123!';
    }

    await login(email, password);
  };

  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerPatient,
        registerDoctor,
        logout,
        switchRoleDemo,
        refreshUser,
        isPatient,
        isDoctor,
        isAdmin,
      }}
    >
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
