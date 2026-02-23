import Link from 'next/link';
import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { ProductsAdminClient } from '@/app/admin/(protected)/products/products-admin-client';

export default function AdminProductsPage() {
  return (
    <AdminShell title='Productos'>
      <div className='flex items-center justify-between gap-3'>
        <p className='text-sm text-muted-foreground'>
          Crear, editar, activar/desactivar y reordenar.
        </p>
        <Button asChild>
          <Link href='/admin/products/new'>Nuevo producto</Link>
        </Button>
      </div>

      <ProductsAdminClient />
    </AdminShell>
  );
}
