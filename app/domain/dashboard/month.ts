export function isValidDashboardMonthLabel(value: string): boolean {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);

  return Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12;
}

export function monthStartUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0));
}

export function addMonthsUTC(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1, 0, 0, 0));
}

export function monthLabelUTC(date: Date): string {
  return `${String(date.getUTCFullYear())}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthStartFromLabel(label: string): Date {
  if (!isValidDashboardMonthLabel(label)) {
    throw new Error("Mês do dashboard inválido");
  }

  const [year, month] = label.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, 1, 0, 0, 0));
}

export function shiftDashboardMonthLabel(label: string, months: number): string {
  return monthLabelUTC(addMonthsUTC(monthStartFromLabel(label), months));
}

export function resolveDashboardMonthLabel(params: {
  requestedMonthLabel?: string | null;
  now?: Date;
}): string {
  const requested = params.requestedMonthLabel?.trim();
  if (requested && isValidDashboardMonthLabel(requested)) {
    return requested;
  }

  const now = params.now ?? new Date();
  return monthLabelUTC(monthStartUTC(now));
}
