import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockClient } from '@/app/stock/stock-client';
import { Suspense } from 'react';

export default function StockPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Catálogo</h1>
        <p className='text-muted-foreground'>
          Filtrá por género y tipo. Buscá por nombre.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className='py-10 text-sm text-muted-foreground'>
                Cargando…
              </div>
            }
          >
            <StockClient />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
