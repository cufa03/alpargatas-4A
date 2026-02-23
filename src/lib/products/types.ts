export type ProductGender = 'men' | 'women' | 'unisex';
export type ProductType =
  | 'common'
  | 'reinforced'
  | 'pvc'
  | 'designed'
  | 'other';

export type Product = {
  id: string;
  name: string;
  description: string;
  sku: string;
  gender: ProductGender;
  type: ProductType;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type ProductInput = Omit<
  Product,
  'id' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'isActive'
> & {
  isActive?: boolean;
};
