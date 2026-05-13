import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginCode: (email: string, code: string) => Promise<void>;
  register: (email: string, password: string, code: string) => Promise<void>;
  logout: () => void;
  updateAvatar: (avatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadAuthState(): AuthState {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  return { user, token, isAuthenticated: !!token && !!user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadAuthState);

  const saveAuth = useCallback((token: string, userData: Omit<User, 'password'>) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuth({ token, user: userData as User, isAuthenticated: true });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.data.code !== 200) throw new Error(res.data.msg || `Login failed (code ${res.data.code})`);
    const { token, ...userData } = res.data.data!;
    saveAuth(token, userData);
  }, [saveAuth]);

  const loginCode = useCallback(async (email: string, code: string) => {
    const res = await authApi.loginCode({ email, code });
    if (res.data.code !== 200) throw new Error(res.data.msg || `Login failed (code ${res.data.code})`);
    const { token, ...userData } = res.data.data!;
    saveAuth(token, userData);
  }, [saveAuth]);

  const register = useCallback(async (email: string, password: string, code: string) => {
    const res = await authApi.register({ email, password, code });
    if (res.data.code !== 200) throw new Error(res.data.msg || `Registration failed (code ${res.data.code})`);
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ user: null, token: null, isAuthenticated: false });
  }, []);

  const updateAvatar = useCallback(async (avatarUrl: string) => {
    await authApi.updateAvatar(avatarUrl);
    if (auth.user) {
      const updated = { ...auth.user, avatar: avatarUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      setAuth((prev) => ({ ...prev, user: updated }));
    }
  }, [auth.user]);

  return (
    <AuthContext.Provider value={{ ...auth, login, loginCode, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
