import type { MonthRepo } from "../ports";

export async function reopenMonth(params: { repo: MonthRepo; monthId: string }) {
  await params.repo.reopenMonth({ monthId: params.monthId });
  return { ok: true } as const;
}
