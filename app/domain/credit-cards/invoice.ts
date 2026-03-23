import type {
  CreditCardInvoice,
  CreditCardPurchase,
  CreditCardPurchasePrepayment,
} from "~/domain/credit-cards/entity";

function parseYm(ym: string): { y: number; m: number } | null {
  const m = /^([0-9]{4})-([0-9]{2})$/.exec(ym);
  if (!m) return null;
  const y = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isInteger(y) || !Number.isInteger(mm) || mm < 1 || mm > 12) return null;
  return { y, m: mm };
}

export function isValidYm(ym: string): boolean {
  return parseYm(ym) !== null;
}

export function addMonthsToYm(ym: string, months: number): string {
  const parsed = parseYm(ym);
  if (!parsed) throw new Error("YM inválido");

  const total = parsed.y * 12 + (parsed.m - 1) + months;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}`;
}

export function diffYm(a: string, b: string): number {
  // a - b em meses
  const pa = parseYm(a);
  const pb = parseYm(b);
  if (!pa || !pb) throw new Error("YM inválido");
  return (pa.y - pb.y) * 12 + (pa.m - pb.m);
}

export function splitInstallments(amountCents: number, total: number): number[] {
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw new Error("amount inválido");
  if (!Number.isInteger(total) || total <= 0) throw new Error("total inválido");

  const base = Math.floor(amountCents / total);
  const rem = amountCents % total;

  const out: number[] = [];
  for (let i = 0; i < total; i++) {
    out.push(base + (i < rem ? 1 : 0));
  }
  return out;
}

function lastDayOfMonthUTC(year: number, month1to12: number): number {
  // month1to12: 1..12
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

export function computeInvoiceYmForDate(params: {
  occurredAt: Date;
  closingDay: number;
}): string {
  const date = params.occurredAt;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("occurredAt inválido");
  }
  if (!Number.isInteger(params.closingDay) || params.closingDay < 1 || params.closingDay > 31) {
    throw new Error("closingDay inválido");
  }

  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1; // 1..12
  const d = date.getUTCDate();

  function clampDay(year: number, month: number, day: number): number {
    const last = lastDayOfMonthUTC(year, month);
    return Math.min(day, last);
  }

  // Se estamos até o dia de fechamento, fecha no mês atual; senão no mês seguinte.
  const closesThisMonthOn = clampDay(y, m, params.closingDay);

  let invoiceY = y;
  let invoiceM = m;
  if (d > closesThisMonthOn) {
    const next = new Date(Date.UTC(y, m, 1)); // month rollover
    invoiceY = next.getUTCFullYear();
    invoiceM = next.getUTCMonth() + 1;
  }

  return `${String(invoiceY).padStart(4, "0")}-${String(invoiceM).padStart(2, "0")}`;
}

export function buildInvoice(params: {
  creditCardId: string;
  ym: string;
  purchases: CreditCardPurchase[];
  prepayments: CreditCardPurchasePrepayment[];
}): CreditCardInvoice {
  if (!isValidYm(params.ym)) throw new Error("ym inválido");

  const prepaymentsByPurchaseId = new Map<string, CreditCardPurchasePrepayment[]>();
  for (const p of params.prepayments) {
    const list = prepaymentsByPurchaseId.get(p.purchaseId) ?? [];
    list.push(p);
    prepaymentsByPurchaseId.set(p.purchaseId, list);
  }

  const lines = params.purchases
    .map((purchase) => {
      const amounts = splitInstallments(purchase.amountCents, purchase.installmentsTotal);

      const preps = (prepaymentsByPurchaseId.get(purchase.id) ?? []).slice();
      preps.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      // Aloca antecipações do fim para o começo.
      let tail = amounts.length - 1;
      const prepaidAmountByYm = new Map<string, number>();

      for (const prep of preps) {
        const count = Math.max(0, Math.floor(prep.installmentsCount));
        if (count === 0) continue;

        const remaining = tail + 1;
        const toPay = Math.min(count, remaining);

        let sum = 0;
        for (let i = 0; i < toPay; i++) {
          sum += amounts[tail - i] ?? 0;
        }

        tail -= toPay;

        prepaidAmountByYm.set(prep.ym, (prepaidAmountByYm.get(prep.ym) ?? 0) + sum);
      }

      const monthIndex = diffYm(params.ym, purchase.firstInvoiceYm);
      const withinRange = monthIndex >= 0 && monthIndex < amounts.length;

      const regularDue = withinRange && monthIndex <= tail ? (amounts[monthIndex] ?? 0) : 0;
      const prepaidDue = prepaidAmountByYm.get(params.ym) ?? 0;

      // billedThisYm é contagem de parcelas cobradas no mês; para prepay, a contagem é a soma de installmentsCount.
      const prepaidCountThisYm = preps
        .filter((p) => p.ym === params.ym)
        .reduce((acc, p) => acc + p.installmentsCount, 0);

      const billedCountThisYm = (regularDue > 0 ? 1 : 0) + prepaidCountThisYm;

      const amountCentsThisYm = regularDue + prepaidDue;

      if (amountCentsThisYm === 0) return null;

      return {
        purchaseId: purchase.id,
        description: purchase.description,
        occurredAt: purchase.occurredAt,
        installments: {
          total: purchase.installmentsTotal,
          billedThisYm: billedCountThisYm,
        },
        amountCentsThisYm,
      };
    })
    .filter((v): v is NonNullable<typeof v> => v !== null);

  const totalCents = lines.reduce((acc, l) => acc + l.amountCentsThisYm, 0);

  return {
    creditCardId: params.creditCardId,
    ym: params.ym,
    totalCents,
    lines,
  };
}
