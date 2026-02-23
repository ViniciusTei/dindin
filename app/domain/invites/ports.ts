export type AcceptInviteResult =
  | { ok: true; householdId: string }
  | { ok: false; reason: "invalid" | "full" };

export interface InvitesRepo {
  createInviteLink(params: {
    householdId: string;
    createdByUserId: string;
    ttlHours: number;
  }): Promise<{ token: string; expiresAt: Date }>;

  acceptInviteLink(params: {
    token: string;
    userId: string;
    maxMembers: number;
  }): Promise<AcceptInviteResult>;
}
