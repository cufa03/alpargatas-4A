import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFeaturedProducts } from '@/lib/firebase/firestore';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Server component: fetch featured products (safe; rules apply).
  const featured = await getFeaturedProducts().catch((e) => {
    console.error('Error al cargar destacados:', e);
    return [];
  });

  return (
    <div className='space-y-10'>
      <section className='rounded-xl border bg-card p-8'>
        <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-semibold tracking-tight'>
              Alpargatas mayoristas, directo de fábrica
            </h1>
            <p className='max-w-2xl text-muted-foreground'>
              Catálogo sin precios online. Consultá por WhatsApp disponibilidad,
              mínimos y tiempos de entrega y hace tu pedido!
            </p>
          </div>
          <div className='flex gap-2'>
            <Button asChild size='lg'>
              <Link href='/stock'>Ver catálogo</Link>
            </Button>
            <Button asChild size='lg' variant='outline'>
              <Link href='/contact'>Cómo comprar</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className='space-y-4'>
        <div className='flex items-end justify-between'>
          <div>
            <h2 className='text-xl font-semibold'>Destacados</h2>
            <p className='text-sm text-muted-foreground'>
              Selección de productos por orden de catálogo.
            </p>
          </div>
          <Button asChild variant='ghost'>
            <Link href='/stock'>Ver todo</Link>
          </Button>
        </div>

        {featured.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Sin productos cargados</CardTitle>
            </CardHeader>
            <CardContent className='text-muted-foreground'>
              Cuando el administrador cargue productos, van a aparecer acá.
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {featured.map((p) => (
              <Link key={p.id} href={`/stock/${p.id}`} className='group'>
                <Card className='h-full overflow-hidden'>
                  <div className='aspect-4/3 w-full bg-muted'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className='h-full w-full object-cover transition group-hover:scale-[1.01]'
                      loading='lazy'
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className='line-clamp-1'>{p.name}</CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      SKU: {p.sku}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
