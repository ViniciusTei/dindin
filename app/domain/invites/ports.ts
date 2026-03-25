export type AcceptInviteResult =
  | { ok: true; householdId: string }
  | { ok: false; reason: "invalid" | "full" };

export type RegisterUserFromInviteResult =
  | { ok: true; householdId: string }
  | { ok: false; reason: "invalid" | "full" | "username_taken" };

export interface InvitesRepo {
  createInviteLink(params: {
    householdId: string;
    createdByUserId: string;
    ttlHours: number;
  }): Promise<{ token: string; expiresAt: Date }>;

  acceptInviteLink(params: {
    token: string;
    userId: string;
    maxMembers?: number;
  }): Promise<AcceptInviteResult>;

  registerUserFromInvite(params: {
    token: string;
    userId: string;
    username: string;
    passwordHash: string;
    maxMembers?: number;
  }): Promise<RegisterUserFromInviteResult>;
}
