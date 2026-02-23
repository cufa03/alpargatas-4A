import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/constants';
import { isAdminEmail, verifyIdTokenWithGoogle } from '@/lib/auth/verify';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    idToken?: string;
  } | null;
  const idToken = body?.idToken;

  if (!idToken) {
    return NextResponse.json(
      { ok: false, error: 'Falta idToken' },
      { status: 400 },
    );
  }

  const verified = await verifyIdTokenWithGoogle(idToken);
  if (!verified || !isAdminEmail(verified.email)) {
    return NextResponse.json(
      { ok: false, error: 'No autorizado' },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, idToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60, // 1h aprox (expira similar al idToken)
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
