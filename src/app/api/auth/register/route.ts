import { NextResponse } from 'next/server';
import { createAccount, DuplicateAccountError, type AccountRole } from '@/lib/auth-database';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid registration details.' }, { status: 400 });
  }

  const { name, email, password, role } = body as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    name.trim().length < 2 ||
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== 'string' ||
    password.length < 6 ||
    (role !== 'user' && role !== 'staff')
  ) {
    return NextResponse.json({ error: 'Enter a valid name, email, password, and account type.' }, { status: 400 });
  }

  try {
    const accountRole: AccountRole = role === 'staff' ? 'staff' : 'user';
    const account = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: accountRole,
    };
    createAccount({ ...account, password });
    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateAccountError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Could not save account in local auth store.', error);
    return NextResponse.json({ error: 'Could not save account in the local auth store.' }, { status: 500 });
  }
}
