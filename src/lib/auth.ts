export const AUTH_STORAGE_KEY = 'mediconnect-session';

export type AuthSession = {
  email: string;
  role: string;
  name?: string;
};

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as AuthSession;
    if (!session?.email) return null;

    return session;
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isSignedIn() {
  return !!getStoredSession();
}

export function requireAuthRedirect(target = '/sign-up-login-screen') {
  if (typeof window === 'undefined') return false;

  if (!isSignedIn()) {
    window.location.href = '/sign-up-login-screen';
    return false;
  }

  if (target) {
    window.location.href = target;
  }

  return true;
}
