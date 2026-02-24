import { describe, expect, it, vi } from "vitest";

import { reopenMonth } from "./reopen-month";

describe("domain/month/reopenMonth", () => {
  it("chama repo.reopenMonth", async () => {
    const repo = { reopenMonth: vi.fn(async () => undefined) } as any;

    const result = await reopenMonth({ repo, monthId: "m1" });
    expect(result).toEqual({ ok: true });
    expect(repo.reopenMonth).toHaveBeenCalledWith({ monthId: "m1" });
  });
});
