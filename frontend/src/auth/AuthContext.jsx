/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waking, setWaking] = useState(false);

  const waitForBackend = useCallback(async () => {
    const deadline = Date.now() + 30000;
  if (await api.health()) return true;
  setWaking(true);
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 1500));
      if (await api.health()) return true;
    }
  return false;
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
  await waitForBackend();
      const me = await api.get('/auth/me');
      setUser(me);
  } catch {
      setUser(null);
    } finally {
  setWaking(false);
      setLoading(false);
    }
  }, [waitForBackend]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.post('/auth/login', { email, password });
      setUser(data);
      return data;
    } catch (e) {
      if (e?.code === 'BACKEND_OFFLINE') {
        setWaking(true);
        await waitForBackend();
        setWaking(false);
        const data = await api.post('/auth/login', { email, password });
        setUser(data);
        return data;
      }
      throw e;
    }
  };
  const register = async (email, password, name) => {
    setError(null);
    try {
      const data = await api.post('/auth/register', { email, password, name });
      setUser(data);
      return data;
    } catch (e) {
      if (e?.code === 'BACKEND_OFFLINE') {
        setWaking(true);
        await waitForBackend();
        setWaking(false);
        const data = await api.post('/auth/register', { email, password, name });
        setUser(data);
        return data;
      }
      throw e;
    }
  };
  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    setUser(null);
  };

  const value = { user, loading, error, waking, login, register, logout, refresh: fetchMe };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
