import { AdminShell } from '@/components/admin/admin-shell';
import { ProductUpsertClient } from '@/app/admin/(protected)/products/upsert/product-upsert-client';

export default function NewProductPage() {
  return (
    <AdminShell title='Nuevo producto'>
      <ProductUpsertClient mode='create' />
    </AdminShell>
  );
}
