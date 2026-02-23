'use client';

import { getFirebaseAuth } from '@/lib/firebase/client';

export async function syncSessionCookie(): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return;
  const idToken = await user.getIdToken();
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
}

export async function clearSessionCookie(): Promise<void> {
  await fetch('/api/auth/session', { method: 'DELETE' });
}
