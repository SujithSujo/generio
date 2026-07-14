export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  permissions: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: AuthUser;
};

const STORAGE_KEY = "generio_admin_session";
const COOKIE_NAME = "generio_admin";

/** Cached snapshot for useSyncExternalStore — must be referentially stable. */
let cachedRaw: string | null | undefined;
let cachedSession: AuthSession | null = null;

function canUseDom() {
  return typeof window !== "undefined";
}

export function getStoredSession(): AuthSession | null {
  if (!canUseDom()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedSession;
  }

  cachedRaw = raw;
  if (!raw) {
    cachedSession = null;
    return null;
  }

  try {
    cachedSession = JSON.parse(raw) as AuthSession;
    return cachedSession;
  } catch {
    cachedSession = null;
    return null;
  }
}

export function storeSession(session: AuthSession) {
  if (!canUseDom()) return;
  const raw = JSON.stringify(session);
  window.localStorage.setItem(STORAGE_KEY, raw);
  document.cookie = `${COOKIE_NAME}=1; path=/; SameSite=Lax`;
  cachedRaw = raw;
  cachedSession = session;
}

export function clearSession() {
  if (!canUseDom()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; Max-Age=0; SameSite=Lax`;
  cachedRaw = null;
  cachedSession = null;
}

export function hasAdminCookie() {
  if (!canUseDom()) return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${COOKIE_NAME}=`));
}
