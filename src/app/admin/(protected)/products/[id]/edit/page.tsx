import { AdminShell } from '@/components/admin/admin-shell';
import { ProductUpsertClient } from '@/app/admin/(protected)/products/upsert/product-upsert-client';

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return (
    <AdminShell title='Editar producto'>
      <ProductUpsertClient mode='edit' productId={id} />
    </AdminShell>
  );
}
