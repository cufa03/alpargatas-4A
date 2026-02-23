import { getClientEnv } from '@/lib/env';
import { toast } from 'sonner';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('La imagen supera el máximo permitido (2MB).');
  }

  const env = getClientEnv();
  const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let details = '';
    try {
      const data = (await res.json()) as { error?: { message?: string } };
      details = data.error?.message ? ` (${data.error.message})` : '';
    } catch {
      // ignore
    }
    throw new Error(`Error subiendo imagen a Cloudinary${details}.`);
  }

  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error('Cloudinary no devolvió secure_url.');
  }
  return data.secure_url;
}

export function getCloudinaryPublicIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // Example: /<cloud_name>/image/upload/v123/folder/name.jpg
    const parts = u.pathname.split('/').filter(Boolean);
    const uploadIndex = parts.findIndex((p) => p === 'upload');
    if (uploadIndex < 0) return null;

    const afterUpload = parts.slice(uploadIndex + 1);
    const withoutVersion = afterUpload[0]?.startsWith('v')
      ? afterUpload.slice(1)
      : afterUpload;
    if (withoutVersion.length === 0) return null;

    const filename = withoutVersion.join('/');
    // remove extension
    return filename.replace(/\.[a-z0-9]+$/i, '');
  } catch (err) {
    console.error('Error al obtener imagen cloudinary:', err);
    toast.error('No se pudo guardar el orden');
    return null;
  }
}
