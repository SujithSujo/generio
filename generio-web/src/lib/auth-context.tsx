"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { login as apiLogin, logout as apiLogout, type AuthResponse } from "./auth-service";
import {
  clearSession,
  getStoredSession,
  storeSession,
  type AuthSession,
  type AuthUser,
} from "./auth-storage";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toSession(response: AuthResponse): AuthSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    user: {
      id: response.user.id,
      email: response.user.email,
      fullName: response.user.fullName,
      roles: response.user.roles,
      permissions: response.user.permissions ?? [],
    },
  };
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener("generio-auth-change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("generio-auth-change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSessionSnapshot() {
  return getStoredSession();
}

function getServerSessionSnapshot() {
  return null;
}

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("generio-auth-change"));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedSession = useSyncExternalStore(
    subscribe,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const [overrideSession, setOverrideSession] = useState<AuthSession | null | undefined>(undefined);
  const session = overrideSession === undefined ? storedSession : overrideSession;

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    const next = toSession(response);
    storeSession(next);
    setOverrideSession(next);
    notifyAuthChange();
  }, []);

  const logout = useCallback(async () => {
    const current = getStoredSession();
    try {
      if (current?.refreshToken) {
        await apiLogout(current.refreshToken);
      }
    } catch {
      // Ignore network logout failures; clear local session anyway.
    }
    clearSession();
    setOverrideSession(null);
    notifyAuthChange();
  }, []);

  const hasPermission = useCallback(
    (code: string) => {
      if (!session?.user) return false;
      if (session.user.roles.includes("SuperAdministrator")) return true;
      return session.user.permissions.includes(code);
    },
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isLoading: false,
      login,
      logout,
      hasPermission,
    }),
    [session, login, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
