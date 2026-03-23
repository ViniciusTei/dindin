import { describe, expect, it } from "vitest";

import { makeInvitesRepo } from "~/domain/test/fakes";

import { acceptInviteLink } from "./accept-invite-link";

describe("domain/invites/acceptInviteLink", () => {
  it("não impõe limite padrão de membros", async () => {
    let seenMaxMembers: number | undefined;
    const invitesRepo = makeInvitesRepo();
    const spyRepo = {
      ...invitesRepo,
      async acceptInviteLink(params: { token: string; userId: string; maxMembers?: number }) {
        seenMaxMembers = params.maxMembers;
        return { ok: true, householdId: "h1" } as const;
      },
    };

    const result = await acceptInviteLink(spyRepo, { token: "t", userId: "u" });
    expect(result).toEqual({ ok: true, householdId: "h1" });
    expect(seenMaxMembers).toBeUndefined();
  });
});
