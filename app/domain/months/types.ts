export type Ym = string & { readonly __brand: "Ym" };

export function isYm(value: string): value is Ym {
  return /^\d{4}-\d{2}$/.test(value);
}

export function makeYm(params: { year: string; month: string }): Ym | null {
  const candidate = `${params.year}-${params.month}`;
  if (!isYm(candidate)) return null;
  return candidate;
}
