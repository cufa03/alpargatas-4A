export function normalizeFilter(
  value: string | null | undefined,
): string | undefined {
  const v = (value ?? '').trim();
  if (!v || v === 'all') return undefined;
  return v;
}
