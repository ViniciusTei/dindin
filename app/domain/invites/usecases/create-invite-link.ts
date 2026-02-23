import type { InvitesRepo } from "~/domain/invites/ports";

export async function createInviteLink(
  invitesRepo: InvitesRepo,
  params: {
    householdId: string;
    createdByUserId: string;
    ttlHours?: number;
  }
) {
  return invitesRepo.createInviteLink({
    householdId: params.householdId,
    createdByUserId: params.createdByUserId,
    ttlHours: params.ttlHours ?? 24,
  });
}
