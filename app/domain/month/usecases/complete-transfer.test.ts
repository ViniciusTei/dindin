import { describe, expect, it, vi } from "vitest";

import { makeNow } from "~/domain/test/fakes";

import { completeTransfer } from "./complete-transfer";

describe("domain/month/completeTransfer", () => {
  it("falha com TRANSFER_INVALID quando transferId vazio", async () => {
    const repo = { completeTransfer: vi.fn(async () => undefined) } as any;

    const result = await completeTransfer({
      repo,
      monthId: "m1",
      transferId: "",
      completed: true,
      now: makeNow(),
    });

    expect(result).toEqual({ ok: false, error: "TRANSFER_INVALID" });
    expect(repo.completeTransfer).not.toHaveBeenCalled();
  });

  it("marca completedAt quando completed=true", async () => {
    const repo = { completeTransfer: vi.fn(async () => undefined) } as any;
    const now = makeNow("2026-02-23T12:00:00.000Z");

    const result = await completeTransfer({
      repo,
      monthId: "m1",
      transferId: "t1",
      completed: true,
      now,
    });

    expect(result).toEqual({ ok: true });
    expect(repo.completeTransfer).toHaveBeenCalledWith({
      monthId: "m1",
      transferId: "t1",
      completedAt: new Date("2026-02-23T12:00:00.000Z"),
    });
  });

  it("limpa completedAt quando completed=false", async () => {
    const repo = { completeTransfer: vi.fn(async () => undefined) } as any;

    const result = await completeTransfer({
      repo,
      monthId: "m1",
      transferId: "t1",
      completed: false,
      now: makeNow("2026-02-23T12:00:00.000Z"),
    });

    expect(result).toEqual({ ok: true });
    expect(repo.completeTransfer).toHaveBeenCalledWith({
      monthId: "m1",
      transferId: "t1",
      completedAt: null,
    });
  });
});
