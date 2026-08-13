import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { api, setAccessToken, getAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ip, setIp] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestOtp = useCallback(async (email, password) => {
    const data = await api.requestOtp(email, password);
    return data;
  }, []);

  const completeLogin = useCallback(async (pendingToken, code) => {
    const data = await api.verifyOtp(pendingToken, code);
    setAccessToken(data.accessToken);
    setUser(data.user);
    setIp(data.ip);
    return data;
  }, []);

  const completeReset = useCallback(async (pendingToken, code, newPassword) => {
    const data = await api.resetPassword(pendingToken, code, newPassword);
    setAccessToken(data.accessToken);
    setUser(data.user);
    setIp(data.ip);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    setUser(null);
    setIp(null);
  }, []);

  const loadMe = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await api.me();
      setUser(data.user);
      setIp(data.ip);
      return data;
    } catch {
      setAccessToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, ip, loading, requestOtp, completeLogin, completeReset, logout, loadMe, setUser, setIp }),
    [user, ip, loading, requestOtp, completeLogin, completeReset, logout, loadMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
