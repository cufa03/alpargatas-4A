import { z } from 'zod';

export const productGenderSchema = z.enum(['men', 'women', 'unisex']);
export const productTypeSchema = z.enum([
  'common',
  'reinforced',
  'pvc',
  'designed',
  'other',
]);

export const productFormSchema = z.object({
  name: z.string().min(2, 'Ingresá un nombre válido'),
  sku: z
    .string()
    .min(2, 'Ingresá un SKU válido')
    .max(64)
    .regex(/^[A-Za-z0-9-_]+$/, 'Usá solo letras, números, - o _'),
  description: z.string().min(10, 'La descripción es demasiado corta'),
  gender: productGenderSchema,
  type: productTypeSchema,
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
