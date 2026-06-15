import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getCurrentEmployee, login as loginRequest, register as registerRequest } from '../api/authApi';
import { ApiClientError } from '../api/http';
import type { EmployeeProfile, LoginPayload, RegisterPayload } from '../types/auth';
import { clearAccessToken, readAccessToken, saveAccessToken } from './tokenStorage';

type AuthState =
  | { status: 'loading'; token: null; employee: null }
  | { status: 'anonymous'; token: null; employee: null }
  | { status: 'authenticated'; token: string; employee: EmployeeProfile };

type AuthContextValue = {
  state: AuthState;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', token: null, employee: null });

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token = await readAccessToken();
      if (!token) {
        if (mounted) setState({ status: 'anonymous', token: null, employee: null });
        return;
      }
      try {
        const employee = await getCurrentEmployee(token);
        if (mounted) setState({ status: 'authenticated', token, employee });
      } catch {
        await clearAccessToken();
        if (mounted) setState({ status: 'anonymous', token: null, employee: null });
      }
    }

    void restoreSession();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      const auth = await loginRequest(payload);
      await saveAccessToken(auth.accessToken);
      setState({ status: 'authenticated', token: auth.accessToken, employee: auth.employee });
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      throw new Error('Unable to reach the FMR API. Check the backend URL and network connection.');
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const auth = await registerRequest(payload);
      await saveAccessToken(auth.accessToken);
      setState({ status: 'authenticated', token: auth.accessToken, employee: auth.employee });
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      throw new Error('Unable to reach the FMR API. Check the backend URL and network connection.');
    }
  }, []);

  const logout = useCallback(async () => {
    await clearAccessToken();
    setState({ status: 'anonymous', token: null, employee: null });
  }, []);

  const value = useMemo(
    () => ({ state, login, register, logout }),
    [login, logout, register, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
