import { invitesRepo } from "~/db/repositories/invites.repo.server";
import { acceptInviteLink as acceptInviteLinkUsecase } from "~/domain/invites/usecases/accept-invite-link";
import { createInviteLink as createInviteLinkUsecase } from "~/domain/invites/usecases/create-invite-link";

export async function createInviteLink(params: {
  householdId: string;
  createdByUserId: string;
  ttlHours?: number;
}) {
  return createInviteLinkUsecase(invitesRepo, params);
}

export async function acceptInviteLink(params: {
  token: string;
  userId: string;
}) {
  return acceptInviteLinkUsecase(invitesRepo, params);
}
