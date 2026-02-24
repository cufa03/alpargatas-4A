import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getProductById } from '@/lib/firebase/firestore';
import { getClientEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

function buildWhatsappUrl(message: string) {
  const env = getClientEnv();
  const text = encodeURIComponent(message);
  const number = env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/^\+/, '');
  return `https://wa.me/${number}?text=${text}`;
}

export default async function ProductDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const product = await getProductById(id);
  if (!product || !product.isActive) notFound();

  const message = `Hola! Quiero agregar a mi orden el prducto ${product.name}. Por favor quiero saber disponibilidad y cantidad minima para realizar el pedido`;

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold'>{product.name}</h1>
          {/* <p className='text-muted-foreground'>SKU: {product.sku}</p> */}
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>{product.gender}</Badge>
          <Badge variant='secondary'>{product.type}</Badge>
        </div>
      </div>

      <Card>
        <CardContent className='grid gap-6 p-6 md:grid-cols-2'>
          <div className='aspect-4/3 w-full overflow-hidden rounded-lg border bg-muted'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className='h-full w-full object-cover'
            />
          </div>

          <div className='space-y-4'>
            <div>
              <h2 className='text-lg font-semibold'>Descripción</h2>
              <p className='mt-2 whitespace-pre-wrap text-sm text-muted-foreground'>
                {product.description}
              </p>
            </div>

            <Button asChild size='lg' className='w-full sm:w-auto'>
              <a
                href={buildWhatsappUrl(message)}
                target='_blank'
                rel='noreferrer'
              >
                Consultar en WhatsApp
              </a>
            </Button>

            <p className='text-xs text-muted-foreground'>
              Venta mayorista: consultá por disponibilidad, mínimo de compra y
              tiempos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
