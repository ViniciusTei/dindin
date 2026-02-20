export type MemberIncome = {
  userId: string;
  incomeCents: number; // pode ser 0
};

export type MemberDue = {
  userId: string;
  dueCents: number;
};

function distributeResidual(
  parts: Array<{ userId: string; raw: number }>,
  totalCents: number
): MemberDue[] {
  const floored = parts.map((p) => ({
    userId: p.userId,
    dueCents: Math.floor(p.raw),
    frac: p.raw - Math.floor(p.raw),
  }));

  let sum = floored.reduce((acc, p) => acc + p.dueCents, 0);
  let residual = totalCents - sum;

  floored.sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < floored.length && residual > 0; i++) {
    floored[i].dueCents += 1;
    residual -= 1;
  }

  // fallback: se ainda sobrar (caso raro), distribui do começo
  let idx = 0;
  while (residual > 0 && floored.length > 0) {
    floored[idx % floored.length].dueCents += 1;
    residual -= 1;
    idx += 1;
  }

  // reordenar para não depender do sort do residual
  const map = new Map(floored.map((p) => [p.userId, p.dueCents] as const));
  return parts.map((p) => ({ userId: p.userId, dueCents: map.get(p.userId) ?? 0 }));
}

export function computeDueByIncome(params: {
  members: MemberIncome[];
  totalExpenseCents: number;
}): MemberDue[] {
  const totalIncome = params.members.reduce((acc, m) => acc + m.incomeCents, 0);
  const count = params.members.length;

  if (count === 0) return [];

  if (totalIncome <= 0) {
    const equal = params.totalExpenseCents / count;
    return distributeResidual(
      params.members.map((m) => ({ userId: m.userId, raw: equal })),
      params.totalExpenseCents
    );
  }

  return distributeResidual(
    params.members.map((m) => ({
      userId: m.userId,
      raw: (params.totalExpenseCents * m.incomeCents) / totalIncome,
    })),
    params.totalExpenseCents
  );
}

export function suggestTransfersToAdmin(params: {
  adminUserId: string;
  dues: MemberDue[];
}): Array<{ fromUserId: string; toUserId: string; amountCents: number }> {
  return params.dues
    .filter((d) => d.userId !== params.adminUserId)
    .map((d) => ({
      fromUserId: d.userId,
      toUserId: params.adminUserId,
      amountCents: Math.max(0, d.dueCents),
    }))
    .filter((t) => t.amountCents > 0);
}
