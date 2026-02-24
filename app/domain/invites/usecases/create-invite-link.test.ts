import { describe, expect, it } from "vitest";

import { makeInvitesRepo } from "~/domain/test/fakes";

import { createInviteLink } from "./create-invite-link";

describe("domain/invites/createInviteLink", () => {
  it("usa ttl default de 24h", async () => {
    const invitesRepo = makeInvitesRepo({
      create: { token: "t1", expiresAt: new Date("2026-02-24T00:00:00.000Z") },
    });

    const result = await createInviteLink(invitesRepo, {
      householdId: "h1",
      createdByUserId: "u1",
    });

    expect(result.token).toBe("t1");
  });
});
