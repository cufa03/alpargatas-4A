import { AdminShell } from '@/components/admin/admin-shell';
import { AdminDashboardClient } from '@/app/admin/(protected)/dashboard-client';

export default function AdminDashboardPage() {
  return (
    <AdminShell title='Dashboard'>
      <AdminDashboardClient />
    </AdminShell>
  );
}
