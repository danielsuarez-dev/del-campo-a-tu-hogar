import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'dch_auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed?.token && parsed?.user ? parsed : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(
        error?.message ?? 'No se pudo iniciar sesión. Verifica tus datos.',
      );
    }

    const data = (await res.json()) as AuthSession;
    if (!data?.token || !data?.user) {
      throw new Error('Respuesta de login inválida');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSession(data);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, supabaseSession: Session | null) => {
        if (supabaseSession && supabaseSession.user) {
          const userMetadata = supabaseSession.user.user_metadata || {};
          const user: AuthUser = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email ?? '',
            name:
              userMetadata.full_name ||
              userMetadata.name ||
              supabaseSession.user.email?.split('@')[0] ||
              '',
            role: userMetadata.role || 'cliente',
            phone: userMetadata.phone ?? undefined,
          };

          const newSession: AuthSession = {
            user,
            token: supabaseSession.access_token,
          };

          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
          setSession(newSession);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
