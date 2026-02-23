import crypto from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "~/db/db.server";
import { inviteLinks, memberships } from "~/db/schema";
import type { InvitesRepo } from "~/domain/invites/ports";

function createId(): string {
  return crypto.randomUUID();
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export const invitesRepo: InvitesRepo = {
  async createInviteLink(params) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + 1000 * 60 * 60 * (params.ttlHours ?? 24)
    );

    await db.insert(inviteLinks).values({
      id: createId(),
      householdId: params.householdId,
      tokenHash,
      expiresAt,
      createdByUserId: params.createdByUserId,
    });

    return { token: rawToken, expiresAt };
  },

  async acceptInviteLink(params) {
    const tokenHash = sha256(params.token);
    const now = new Date();

    const invite = await db.query.inviteLinks.findFirst({
      where: (t, { and, eq, gt, isNull }) =>
        and(eq(t.tokenHash, tokenHash), gt(t.expiresAt, now), isNull(t.usedAt)),
    });
    if (!invite) return { ok: false as const, reason: "invalid" as const };

    const existingMemberships = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(eq(memberships.householdId, invite.householdId));

    if (existingMemberships.length >= params.maxMembers) {
      return { ok: false as const, reason: "full" as const };
    }

    await db.insert(memberships).values({
      householdId: invite.householdId,
      userId: params.userId,
      role: "member",
    });

    await db
      .update(inviteLinks)
      .set({ usedAt: now })
      .where(eq(inviteLinks.id, invite.id));

    return { ok: true as const, householdId: invite.householdId };
  },
};
