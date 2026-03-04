import { describe, expect, it } from "vitest";

import { makeUsersEraseRepo } from "~/domain/test/fakes";
import { eraseUserData } from "~/domain/users/usecases/erase-user-data";

describe("eraseUserData", () => {
  it("retorna ok quando apaga", async () => {
    const usersEraseRepo = makeUsersEraseRepo({ deleted: true });

    const result = await eraseUserData({ usersEraseRepo, userId: "user-1" });

    expect(result).toEqual({ ok: true });
  });

  it("retorna NOT_FOUND quando usuário não existe", async () => {
    const usersEraseRepo = makeUsersEraseRepo({ deleted: false });

    const result = await eraseUserData({ usersEraseRepo, userId: "user-x" });

    expect(result).toEqual({ ok: false, error: "NOT_FOUND" });
  });
});
