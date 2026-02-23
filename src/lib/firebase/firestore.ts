import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase/client';
import type { Product } from '@/lib/products/types';

function productsCol() {
  return collection(getFirestoreDb(), 'products');
}

function asDate(value: unknown): Date | null {
  // Firestore Timestamp has toDate(); but we keep it safe and runtime-agnostic.
  if (!value) return null;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (value as any).toDate?.() ?? null;
  }
  return null;
}

function productFromDoc(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    name: String(data.name ?? ''),
    description: String(data.description ?? ''),
    sku: String(data.sku ?? ''),
    gender: data.gender as Product['gender'],
    type: data.type as Product['type'],
    imageUrl: String(data.imageUrl ?? ''),
    isActive: Boolean(data.isActive ?? true),
    sortOrder: Number(data.sortOrder ?? 0),
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(productsCol(), id));
  if (!snap.exists()) return null;
  return productFromDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const q = query(productsCol(), where('sku', '==', sku), limit(1));
  const snap = await getDocs(q);
  const d = snap.docs[0];
  if (!d) return null;
  return productFromDoc(d.id, d.data() as Record<string, unknown>);
}

export type ListProductsParams = {
  onlyActive?: boolean;
  gender?: string;
  type?: string;
  pageSize?: number;
  cursor?: {
    sortOrder: number;
    docId: string;
  };
};

export async function listProducts(params: ListProductsParams) {
  const constraints: QueryConstraint[] = [];
  if (params.onlyActive) constraints.push(where('isActive', '==', true));

  const q = query(productsCol(), ...constraints);
  const snap = await getDocs(q);

  let allItems = snap.docs.map((d) =>
    productFromDoc(d.id, d.data() as Record<string, unknown>),
  );

  // Client-side filters to avoid fragile composite indexes.
  if (params.gender)
    allItems = allItems.filter((p) => p.gender === params.gender);
  if (params.type) allItems = allItems.filter((p) => p.type === params.type);

  // Deterministic ordering: sortOrder asc, then docId asc.
  allItems.sort((a, b) => {
    const diff = a.sortOrder - b.sortOrder;
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });

  const isAfterCursor = (
    p: Product,
    cursor: NonNullable<ListProductsParams['cursor']>,
  ) => {
    if (p.sortOrder !== cursor.sortOrder) return p.sortOrder > cursor.sortOrder;
    return p.id.localeCompare(cursor.docId) > 0;
  };

  if (params.cursor) {
    const idx = allItems.findIndex((p) => isAfterCursor(p, params.cursor!));
    allItems = idx >= 0 ? allItems.slice(idx) : [];
  }

  const pageSize = params.pageSize ?? 200;
  const items = allItems.slice(0, pageSize);
  const last = items.at(-1);
  const lastCursor = last
    ? { sortOrder: last.sortOrder, docId: last.id }
    : null;

  return { items, cursor: lastCursor };
}

export async function getFeaturedProducts() {
  const res = await listProducts({ onlyActive: true, pageSize: 200 });
  return res.items.slice(0, 6);
}

export async function createProduct(params: {
  input: {
    name: string;
    description: string;
    sku: string;
    gender: string;
    type: string;
    imageUrl: string;
    isActive: boolean;
  };
}) {
  // Compute next sortOrder.
  const lastSnap = await getDocs(
    query(productsCol(), orderBy('sortOrder', 'desc'), limit(1)),
  );
  const lastSortOrder = Number(lastSnap.docs[0]?.data()?.sortOrder ?? 0);
  const nextSortOrder = lastSnap.empty ? 1 : lastSortOrder + 1;

  const docRef = doc(productsCol());
  await setDoc(docRef, {
    ...params.input,
    sortOrder: nextSortOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateProduct(params: {
  id: string;
  patch: Partial<{
    name: string;
    description: string;
    sku: string;
    gender: string;
    type: string;
    imageUrl: string;
    isActive: boolean;
  }>;
}) {
  await updateDoc(doc(productsCol(), params.id), {
    ...params.patch,
    updatedAt: serverTimestamp(),
  });
}

export async function setProductActive(params: {
  id: string;
  isActive: boolean;
}) {
  await updateProduct({ id: params.id, patch: { isActive: params.isActive } });
}

export async function reorderProducts(params: {
  orderedIds: string[];
  startingSortOrder?: number;
}) {
  const batch = writeBatch(getFirestoreDb());
  const base = params.startingSortOrder ?? 1;
  params.orderedIds.forEach((id, index) => {
    batch.update(doc(productsCol(), id), {
      sortOrder: base + index,
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}
