import type { InvitesRepo } from "~/domain/invites/ports";

export async function acceptInviteLink(
  invitesRepo: InvitesRepo,
  params: {
    token: string;
    userId: string;
    maxMembers?: number;
  }
) {
  return invitesRepo.acceptInviteLink({
    token: params.token,
    userId: params.userId,
    maxMembers: params.maxMembers,
  });
}
