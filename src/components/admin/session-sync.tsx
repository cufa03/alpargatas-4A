'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { syncSessionCookie } from '@/lib/auth/session';

export function SessionSync() {
  useEffect(() => {
    // Keep the httpOnly cookie in sync with the current Firebase user.
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (!user) return;
      await syncSessionCookie().catch(() => undefined);
    });
    return () => unsub();
  }, []);
  return null;
}
