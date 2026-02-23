'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listProducts } from '@/lib/firebase/firestore';

export function AdminDashboardClient() {
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [inactiveCount, setInactiveCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listProducts({ onlyActive: true, pageSize: 500 }),
      listProducts({ onlyActive: false, pageSize: 500 }),
    ])
      .then(([active, all]) => {
        if (cancelled) return;
        setActiveCount(active.items.length);
        setInactiveCount(all.items.filter((p) => !p.isActive).length);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error('Error al cargar conteos del dashboard:', e);
        setActiveCount(0);
        setInactiveCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Productos activos</CardTitle>
        </CardHeader>
        <CardContent className='text-3xl font-semibold'>
          {activeCount === null ? '…' : activeCount}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Productos inactivos</CardTitle>
        </CardHeader>
        <CardContent className='text-3xl font-semibold'>
          {inactiveCount === null ? '…' : inactiveCount}
        </CardContent>
      </Card>
    </div>
  );
}
