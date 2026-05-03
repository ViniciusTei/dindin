export function toCents(input: FormDataEntryValue | null): number | null {
  if (input == null) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // aceita "1234.56" ou "1.234,56" ou "1234,56"
  const normalized = raw
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");

  if (!normalized) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;

  return Math.round(value * 100);
}

/*
 * Formata um valor em centavos para o formato de moeda brasileira, por exemplo:
 * 123456 -> "R$1.234,56"
 * @param cents O valor em centavos
 * @returns O valor formatado como moeda brasileira
 */
export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function amountColorClass(cents: number): string {
  if (cents > 0) return "text-success";
  if (cents < 0) return "text-error";
  return "text-base-content";
}
