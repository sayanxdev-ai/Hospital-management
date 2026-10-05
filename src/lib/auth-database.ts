import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export type AccountRole = 'user' | 'staff';

export type AccountProfile = {
  email: string;
  name: string;
  role: AccountRole;
};

export class DuplicateAccountError extends Error {}

type StoredAccount = AccountProfile & { passwordHash: string };

const accounts = new Map<string, StoredAccount>();

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function passwordMatches(password: string, storedHash: string) {
  const [salt, savedHash] = storedHash.split(':');
  if (!salt || !savedHash || !/^[a-f0-9]{128}$/i.test(savedHash)) return false;

  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(savedHash, 'hex'));
}

export function createAccount(account: AccountProfile & { password: string }) {
  const email = account.email.trim().toLowerCase();
  if (accounts.has(email)) {
    throw new DuplicateAccountError('An account with this email already exists.');
  }

  accounts.set(email, {
    email,
    name: account.name.trim(),
    role: account.role,
    passwordHash: hashPassword(account.password),
  });
}

export function authenticateAccount(email: string, password: string): AccountProfile | null {
  const account = accounts.get(email.trim().toLowerCase());
  if (!account || !passwordMatches(password, account.passwordHash)) return null;

  return { email: account.email, name: account.name, role: account.role };
}
