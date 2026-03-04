import { describe, expect, it } from "vitest";

import { listAccounts } from "~/domain/accounts/usecases/list-accounts";
import { makeAccountsRepo } from "~/domain/test/fakes";

describe("listAccounts", () => {
  it("lista por usuário", async () => {
    const { repo, userId } = makeAccountsRepo({
      userId: "user-1",
      accounts: [
        { id: "a1", name: "Banco" },
        { id: "a2", name: "Carteira" },
      ],
    });

    const rows = await listAccounts({ accountsRepo: repo, userId });

    expect(rows).toHaveLength(2);
    expect(rows[0]?.name).toBe("Banco");
  });
});
