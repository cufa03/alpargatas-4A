import { Suspense } from 'react';
import { AdminLoginClient } from '@/app/admin/login/admin-login-client';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className='py-10 text-sm text-muted-foreground'>Cargando…</div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
