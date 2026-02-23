import type { MonthRepo } from "../ports";

export type CompleteTransferResult =
  | { ok: true }
  | { ok: false; error: "TRANSFER_INVALID" };

export async function completeTransfer(params: {
  repo: MonthRepo;
  monthId: string;
  transferId: string;
  completed: boolean;
  now: () => Date;
}): Promise<CompleteTransferResult> {
  if (!params.transferId) return { ok: false, error: "TRANSFER_INVALID" };

  await params.repo.completeTransfer({
    monthId: params.monthId,
    transferId: params.transferId,
    completedAt: params.completed ? params.now() : null,
  });

  return { ok: true };
}
