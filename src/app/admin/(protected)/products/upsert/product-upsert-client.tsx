'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  productFormSchema,
  type ProductFormValues,
} from '@/lib/products/schemas';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  createProduct,
  getProductById,
  getProductBySku,
  updateProduct,
} from '@/lib/firebase/firestore';
import { getAuth } from 'firebase/auth';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

const genderOptions = [
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

export function ProductUpsertClient(
  props: { mode: 'create' } | { mode: 'edit'; productId: string },
) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(props.mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      gender: 'unisex',
      type: 'common',
    },
  });

  const productId = props.mode === 'edit' ? props.productId : null;

  useEffect(() => {
    if (props.mode !== 'edit') return;
    let cancelled = false;
    setIsLoading(true);
    getProductById(props.productId)
      .then((p) => {
        if (!p || cancelled) return;
        form.reset({
          name: p.name,
          sku: p.sku,
          description: p.description,
          gender: p.gender,
          type: p.type,
        });
        setCurrentImageUrl(p.imageUrl);
        setIsActive(p.isActive);
      })
      .catch((e) => {
        toast.error('No se pudo cargar el producto');
        console.error('Error al cargar producto:', e);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [props, form]);

  const fileError = useMemo(() => {
    if (props.mode === 'create' && !file) return 'Subí una imagen';
    return null;
  }, [props.mode, file]);

  if (isLoading) {
    return <div className='py-10 text-sm text-muted-foreground'>Cargando…</div>;
  }

  return (
    <form
      className='space-y-6'
      onSubmit={form.handleSubmit(async (values) => {
        console.log(
          'Logged user:',
          getAuth().currentUser?.email,
          getAuth().currentUser?.uid,
        );
        if (fileError) {
          toast.error(fileError);
          return;
        }

        setIsSaving(true);
        try {
          const existing = await getProductBySku(values.sku);
          if (existing) {
            const editingId = props.mode === 'edit' ? props.productId : null;
            if (!editingId || existing.id !== editingId) {
              toast.error('El SKU ya existe. Usá uno diferente.');
              return;
            }
          }

          if (props.mode === 'create') {
            const imageUrl = file ? await uploadImageToCloudinary(file) : '';
            if (!imageUrl) {
              toast.error('No se pudo subir la imagen');
              return;
            }

            await createProduct({
              input: {
                name: values.name,
                sku: values.sku,
                description: values.description,
                gender: values.gender,
                type: values.type,
                imageUrl,
                isActive,
              },
            });

            toast.success('Producto creado');
            router.replace('/admin/products');
            return;
          }

          // edit
          const id = productId!;
          let imageUrl = currentImageUrl;
          if (file) {
            imageUrl = await uploadImageToCloudinary(file);
          }

          await updateProduct({
            id,
            patch: {
              name: values.name,
              sku: values.sku,
              description: values.description,
              gender: values.gender,
              type: values.type,
              imageUrl: imageUrl ?? '',
              isActive,
            },
          });

          toast.success('Producto actualizado');
          router.replace('/admin/products');
        } catch (e) {
          console.error('Error al guardar:', e);
          toast.error('No se pudo guardar');
        } finally {
          setIsSaving(false);
        }
      })}
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Nombre</Label>
          <Input id='name' {...form.register('name')} />
          {form.formState.errors.name?.message ? (
            <p className='text-sm text-destructive'>
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='sku'>SKU</Label>
          <Input id='sku' {...form.register('sku')} />
          {form.formState.errors.sku?.message ? (
            <p className='text-sm text-destructive'>
              {form.formState.errors.sku.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description'>Descripción</Label>
        <Textarea id='description' rows={6} {...form.register('description')} />
        {form.formState.errors.description?.message ? (
          <p className='text-sm text-destructive'>
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Género</Label>
          <Select
            value={form.watch('gender')}
            onValueChange={(v) =>
              form.setValue('gender', v as ProductFormValues['gender'])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Seleccionar' />
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

        <div className='space-y-2'>
          <Label>Tipo</Label>
          <Select
            value={form.watch('type')}
            onValueChange={(v) =>
              form.setValue('type', v as ProductFormValues['type'])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Seleccionar' />
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
      </div>

      <div className='space-y-2'>
        <Label>Imagen (1 por producto)</Label>
        <Input
          type='file'
          accept='image/*'
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
          }}
        />
        {currentImageUrl ? (
          <div className='mt-3 aspect-4/3 max-w-md overflow-hidden rounded-lg border bg-muted'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt='Imagen actual'
              className='h-full w-full object-cover'
            />
          </div>
        ) : null}
      </div>

      {props.mode === 'edit' ? (
        <div className='flex items-center justify-between rounded-md border p-4'>
          <div>
            <p className='font-medium'>Producto activo</p>
            <p className='text-sm text-muted-foreground'>
              Si está inactivo, no aparece en el catálogo público.
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
      ) : null}

      <div className='flex gap-2'>
        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button type='button' variant='outline' onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
