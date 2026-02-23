'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  listProducts,
  reorderProducts,
  setProductActive,
} from '@/lib/firebase/firestore';
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
  // { value: 'other', label: 'Otro' },
];

export function ProductsAdminClient() {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [gender, setGender] = useState('');
  const [type, setType] = useState('');
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderItems, setReorderItems] = useState<Product[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const reload = async () => {
    setIsLoading(true);
    try {
      const res = await listProducts({ pageSize: 500 });
      setItems(res.items);
    } catch (e) {
      console.error('Error al cargar lista de productos:', e);
      toast.error('No se pudieron cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const normalizedGender = normalizeFilter(gender);
  const normalizedType = normalizeFilter(type);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((p) => {
      if (SHOW_FILTERS && normalizedGender && p.gender !== normalizedGender) {
        return false;
      }
      if (SHOW_FILTERS && normalizedType && p.type !== normalizedType) {
        return false;
      }
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.sku.toLowerCase().includes(needle)
      );
    });
  }, [items, q, normalizedGender, normalizedType]);

  const canReorder =
    !q && (!SHOW_FILTERS || (!normalizedGender && !normalizedType));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setReorderItems((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === String(active.id));
      const newIndex = prev.findIndex((p) => p.id === String(over.id));
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='text-sm text-muted-foreground'>
          {reorderMode
            ? 'Arrastrá para reordenar. Guardá para persistir el orden público.'
            : 'Usá búsqueda/filtros o activá el modo reordenar.'}
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant={reorderMode ? 'secondary' : 'outline'}
            onClick={() => {
              if (!reorderMode && !canReorder) {
                toast.error(
                  'Para reordenar, primero limpiá búsqueda y filtros',
                );
                return;
              }
              if (!reorderMode) {
                setReorderItems(
                  [...items].sort((a, b) => a.sortOrder - b.sortOrder),
                );
              }
              setReorderMode((v) => !v);
            }}
            disabled={isLoading}
          >
            {reorderMode ? 'Salir de reordenar' : 'Modo reordenar'}
          </Button>

          {reorderMode ? (
            <>
              <Button
                type='button'
                onClick={async () => {
                  setIsSavingOrder(true);
                  try {
                    await reorderProducts({
                      orderedIds: reorderItems.map((p) => p.id),
                      startingSortOrder: 1,
                    });
                    toast.success('Orden guardado');
                    setReorderMode(false);
                    await reload();
                  } catch (e) {
                    console.error('Error al guardar orden:', e);
                    toast.error('No se pudo guardar el orden');
                  } finally {
                    setIsSavingOrder(false);
                  }
                }}
                disabled={isSavingOrder}
              >
                {isSavingOrder ? 'Guardando…' : 'Guardar orden'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setReorderItems(
                    [...items].sort((a, b) => a.sortOrder - b.sortOrder),
                  );
                  toast.message('Cambios descartados');
                }}
              >
                Descartar
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        <Input
          placeholder='Buscar por nombre o SKU'
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={reorderMode}
          className={SHOW_FILTERS ? undefined : 'md:col-span-3'}
        />

        {SHOW_FILTERS ? (
          <>
            <Select
              value={gender || 'all'}
              onValueChange={setGender}
              disabled={reorderMode}
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

            <Select
              value={type || 'all'}
              onValueChange={setType}
              disabled={reorderMode}
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
          </>
        ) : null}
      </div>

      {isLoading ? (
        <div className='py-10 text-sm text-muted-foreground'>Cargando…</div>
      ) : reorderMode ? (
        <div className='rounded-md border p-3'>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={reorderItems.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-2'>
                {reorderItems.map((p) => (
                  <ReorderRow key={p.id} product={p} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <p className='mt-3 text-xs text-muted-foreground'>
            Tip: el orden guardado impacta en Home (destacados) y en /stock.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className='py-10 text-sm text-muted-foreground'>
          Sin resultados.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className='font-medium'>{p.name}</div>
                  <div className='text-xs text-muted-foreground'>
                    {p.gender} · {p.type}
                  </div>
                </TableCell>
                <TableCell>{p.sku}</TableCell>
                <TableCell>
                  {p.isActive ? (
                    <Badge>Activo</Badge>
                  ) : (
                    <Badge variant='secondary'>Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <Button asChild size='sm' variant='outline'>
                      <Link href={`/admin/products/${p.id}/edit`}>Editar</Link>
                    </Button>
                    <Button
                      size='sm'
                      variant={p.isActive ? 'secondary' : 'default'}
                      onClick={async () => {
                        try {
                          await setProductActive({
                            id: p.id,
                            isActive: !p.isActive,
                          });
                          toast.success(
                            p.isActive
                              ? 'Producto desactivado'
                              : 'Producto activado',
                          );
                          await reload();
                        } catch (e) {
                          console.error(
                            'Error al cambiar estado del producto:',
                            e,
                          );
                          toast.error('No se pudo actualizar el estado');
                        }
                      }}
                    >
                      {p.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function ReorderRow(props: { product: Product }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.product.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-3 rounded-md border bg-card p-3 ${
        isDragging ? 'opacity-70' : 'opacity-100'
      }`}
    >
      <div className='flex min-w-0 items-center gap-2'>
        <button
          type='button'
          className='cursor-grab rounded p-1 text-muted-foreground hover:text-foreground'
          aria-label='Arrastrar'
          {...attributes}
          {...listeners}
        >
          <GripVertical className='h-4 w-4' />
        </button>
        <div className='min-w-0'>
          <div className='truncate font-medium'>{props.product.name}</div>
          <div className='truncate text-xs text-muted-foreground'>
            SKU: {props.product.sku}
          </div>
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        {props.product.isActive ? (
          <Badge>Activo</Badge>
        ) : (
          <Badge variant='secondary'>Inactivo</Badge>
        )}
      </div>
    </div>
  );
}
