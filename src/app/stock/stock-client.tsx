'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { listProducts } from '@/lib/firebase/firestore';
import { normalizeFilter } from '@/lib/filters';
import type { Product } from '@/lib/products/types';

const SHOW_FILTERS = false; // MVP: filters hidden until "all" filter logic is finalized

const genderOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'men', label: 'Hombre' },
  { value: 'women', label: 'Mujer' },
  { value: 'unisex', label: 'Unisex' },
];

const typeOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'common', label: 'Común Eva' },
  { value: 'reinforced', label: 'Reforzada Eva' },
  { value: 'pvc', label: 'PVC' },
  { value: 'designed', label: 'Diseño' },
];

function setQueryParam(url: URL, key: string, value: string) {
  if (!value) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
}

export function StockClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const gender = normalizeFilter(searchParams.get('gender'));
  const type = normalizeFilter(searchParams.get('type'));
  const q = searchParams.get('q') ?? '';

  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setIsLoading(true);
      setError(null);
    });
    listProducts({
      onlyActive: true,
      gender: SHOW_FILTERS ? gender : undefined,
      type: SHOW_FILTERS ? type : undefined,
      pageSize: 200,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error('Error al cargar catálogo:', e);
        setError('No se pudo cargar el catálogo.');
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gender, type]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((p) => {
      return (
        p.name.toLowerCase().includes(needle) ||
        p.sku.toLowerCase().includes(needle)
      );
    });
  }, [items, q]);

  const hasFilters = Boolean((SHOW_FILTERS && (gender || type)) || q);

  return (
    <div className='space-y-4'>
      <div className='grid gap-3 md:grid-cols-3'>
        <div className={SHOW_FILTERS ? 'md:col-span-1' : 'md:col-span-3'}>
          <Input
            placeholder='Buscar por nombre'
            value={q}
            onChange={(e) => {
              const next = e.target.value;
              startTransition(() => {
                const url = new URL(window.location.href);
                setQueryParam(url, 'q', next);
                router.replace(`${pathname}?${url.searchParams.toString()}`);
              });
            }}
          />
        </div>

        {SHOW_FILTERS ? (
          <>
            <div>
              <Select
                value={gender ?? 'all'}
                onValueChange={(value) => {
                  startTransition(() => {
                    const url = new URL(window.location.href);
                    setQueryParam(url, 'gender', normalizeFilter(value) ?? '');
                    router.replace(
                      `${pathname}?${url.searchParams.toString()}`,
                    );
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Género' />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={type ?? 'all'}
                onValueChange={(value) => {
                  startTransition(() => {
                    const url = new URL(window.location.href);
                    setQueryParam(url, 'type', normalizeFilter(value) ?? '');
                    router.replace(
                      `${pathname}?${url.searchParams.toString()}`,
                    );
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Tipo' />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : null}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        {hasFilters ? (
          <>
            <Badge variant='secondary'>Filtrado</Badge>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => {
                startTransition(() => {
                  router.replace(pathname);
                });
              }}
              disabled={isPending}
            >
              Limpiar
            </Button>
          </>
        ) : (
          <Badge variant='secondary'>Todos los productos</Badge>
        )}
        {isPending ? (
          <span className='text-xs text-muted-foreground'>Actualizando…</span>
        ) : null}
      </div>

      {isLoading ? (
        <div className='py-10 text-sm text-muted-foreground'>
          Cargando productos…
        </div>
      ) : error ? (
        <div className='py-10 text-sm text-destructive'>{error}</div>
      ) : filtered.length === 0 ? (
        <div className='py-10 text-sm text-muted-foreground'>
          No hay productos para mostrar.
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/stock/${p.id}`}
              className='group rounded-lg border bg-card overflow-hidden'
            >
              <div className='aspect-4/3 w-full bg-muted'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className='h-full w-full object-cover transition group-hover:scale-[1.01]'
                  loading='lazy'
                />
              </div>
              <div className='p-4'>
                <div className='flex items-center justify-between gap-2'>
                  <h3 className='font-medium line-clamp-1'>{p.name}</h3>
                  <Badge variant='outline' className='shrink-0'>
                    {p.gender}
                  </Badge>
                </div>
                {/* <p className='mt-1 text-sm text-muted-foreground'>
                  SKU: {p.sku}
                </p> */}
                <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
                  {p.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
