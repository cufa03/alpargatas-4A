import { getServerEnv } from '@/lib/env';

export type VerifiedUser = {
  email: string;
};

export async function verifyIdTokenWithGoogle(
  idToken: string,
): Promise<VerifiedUser | null> {
  const env = getServerEnv();
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      cache: 'no-store',
    },
  );

  if (!res.ok) return null;
  const data = (await res.json()) as {
    users?: Array<{ email?: string }>;
  };
  const email = data.users?.[0]?.email;
  if (!email) return null;
  return { email };
}

export function isAdminEmail(email: string) {
  const env = getServerEnv();
  return email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
}
