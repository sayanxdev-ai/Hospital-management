import { NextResponse } from 'next/server';
import { authenticateAccount } from '@/lib/auth-database';

export const runtime = 'nodejs';

const demoAccounts = [
  { email: 'admin@mediconnect.in', password: 'Admin@2026', role: 'Admin', name: 'Admin' },
  { email: 'staff@mediconnect.in', password: 'Staff@2026', role: 'Staff', name: 'Staff' },
  { email: 'user@mediconnect.in', password: 'User@2026', role: 'User', name: 'User' },
];

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('email' in body) ||
    typeof body.email !== 'string' ||
    !('password' in body) ||
    typeof body.password !== 'string'
  ) {
    return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
  }

  try {
    const email = body.email.trim().toLowerCase();
    const demoAccount = demoAccounts.find(
      (account) => account.email === email && account.password === body.password,
    );
    const account = demoAccount ?? authenticateAccount(email, body.password);

    if (!account) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    return NextResponse.json({ account: { email: account.email, role: account.role, name: account.name } });
  } catch (error) {
    console.error('Could not verify login in local auth store.', error);
    return NextResponse.json({ error: 'Could not verify the login details.' }, { status: 500 });
  }
}
