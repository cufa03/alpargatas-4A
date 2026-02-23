'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { clearSessionCookie } from '@/lib/auth/session';

export function AdminLogoutButton() {
  const router = useRouter();
  return (
    <Button
      type='button'
      variant='destructive'
      onClick={async () => {
        await signOut(getFirebaseAuth()).catch(() => undefined);
        await clearSessionCookie().catch(() => undefined);
        toast.success('Sesión cerrada');
        router.replace('/admin/login');
      }}
    >
      Salir
    </Button>
  );
}
