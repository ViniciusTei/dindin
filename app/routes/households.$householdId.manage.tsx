import type { Route } from "./+types/households.$householdId.manage";

import { redirect } from "react-router";

import { requireHouseholdAdmin } from "~/auth/household.server";
import { requireUserId } from "~/auth/session.server";
import { householdsRepo } from "~/db/repositories/households.repo.server";
import { invitesRepo } from "~/db/repositories/invites.repo.server";
import { resolveDashboardMonthLabel } from "~/domain/dashboard/month";
import { addHouseholdMemberByUsername } from "~/domain/households/usecases/add-household-member-by-username";
import { getHouseholdDetails } from "~/domain/households/usecases/get-household-details";
import { removeHouseholdMember } from "~/domain/households/usecases/remove-household-member";
import { updateHousehold } from "~/domain/households/usecases/update-household";
import { updateHouseholdMemberRole } from "~/domain/households/usecases/update-household-member-role";
import { updateHouseholdPaymentShares } from "~/domain/households/usecases/update-household-payment-shares";
import { HouseholdManagePage } from "~/domain/households/ui/HouseholdManagePage";
import { createInviteLink } from "~/domain/invites/usecases/create-invite-link";
import { getRequestOrigin } from "~/lib/request.server";

function parseShareBps(rawValue: FormDataEntryValue | null): number | null {
  const raw = String(rawValue ?? "").trim();
  if (!raw) return null;

  const normalized = raw.replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return Number.NaN;
  }

  return Math.round(value * 100);
}

function mapShareError(error: string) {
  switch (error) {
    case "MEMBER_NOT_FOUND":
      return "Há membros inválidos no rateio informado.";
    case "SHARE_INVALID":
      return "Informe percentuais válidos entre 0 e 100.";
    case "EXPLICIT_TOTAL_EXCEEDED":
      return "A soma dos percentuais explícitos não pode ultrapassar 100%.";
    case "TOTAL_MUST_EQUAL_100":
      return "Quando todos os membros têm percentual explícito, o total deve fechar 100%.";
    default:
      return "Falha ao salvar o rateio.";
  }
}

export function meta() {
  return [{ title: "Gerenciar household | Financeiro" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  await requireHouseholdAdmin({ userId, householdId });

  const url = new URL(request.url);
  const monthLabel = resolveDashboardMonthLabel({
    requestedMonthLabel: url.searchParams.get("month"),
  });

  const household = await getHouseholdDetails({
    householdsRepo,
    userId,
    householdId,
    monthLabel,
    lookbackMonths: 1,
  });

  if (!household) {
    throw new Response("Household não encontrada.", { status: 404 });
  }

  return { household, origin: getRequestOrigin(request) };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  await requireHouseholdAdmin({ userId, householdId });

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "rename") {
    const name = String(form.get("name") ?? "");
    const result = await updateHousehold({ householdsRepo, householdId, name });
    if (!result.ok) {
      return {
        error: result.error === "NAME_REQUIRED" ? "Nome é obrigatório." : "Household não encontrada.",
      };
    }
    return { message: "Nome da household atualizado." };
  }

  if (intent === "add-member") {
    const username = String(form.get("username") ?? "");
    const role = String(form.get("role") ?? "member");
    const result = await addHouseholdMemberByUsername({
      householdsRepo,
      householdId,
      username,
      role,
    });

    if (!result.ok) {
      switch (result.error) {
        case "USERNAME_REQUIRED":
          return { error: "Username é obrigatório." };
        case "ROLE_INVALID":
          return { error: "Papel inválido." };
        case "USER_NOT_FOUND":
          return { error: "Usuário não encontrado." };
        case "ALREADY_MEMBER":
          return { error: "Esse usuário já participa desta household." };
      }
    }

    return { message: "Membro adicionado à household." };
  }

  if (intent === "update-role") {
    const memberUserId = String(form.get("memberUserId") ?? "");
    const role = String(form.get("role") ?? "member");
    const result = await updateHouseholdMemberRole({
      householdsRepo,
      householdId,
      userId: memberUserId,
      role,
    });

    if (!result.ok) {
      switch (result.error) {
        case "ROLE_INVALID":
          return { error: "Papel inválido." };
        case "NOT_FOUND":
          return { error: "Membro não encontrado." };
        case "LAST_ADMIN":
          return { error: "A household precisa manter ao menos um administrador." };
      }
    }

    if (memberUserId === userId && role !== "admin") {
      return redirect(`/households/${householdId}`);
    }

    return { message: "Permissão atualizada." };
  }

  if (intent === "remove-member") {
    const memberUserId = String(form.get("memberUserId") ?? "");
    const result = await removeHouseholdMember({
      householdsRepo,
      householdId,
      userId: memberUserId,
    });

    if (!result.ok) {
      return {
        error:
          result.error === "LAST_ADMIN"
            ? "A household precisa manter ao menos um administrador."
            : "Membro não encontrado.",
      };
    }

    if (memberUserId === userId) {
      return redirect("/households");
    }

    return { message: "Membro removido da household." };
  }

  if (intent === "save-shares") {
    const shares: Array<{ userId: string; shareBps: number | null }> = [];
    for (const [name, value] of form.entries()) {
      if (!name.startsWith("share:")) continue;
      const shareBps = parseShareBps(value);
      if (Number.isNaN(shareBps)) {
        return { error: "Informe percentuais válidos entre 0 e 100." };
      }
      shares.push({ userId: name.slice("share:".length), shareBps });
    }

    const result = await updateHouseholdPaymentShares({
      householdsRepo,
      householdId,
      shares,
    });

    if (!result.ok) {
      return { error: mapShareError(result.error) };
    }

    return { message: "Rateio atualizado com sucesso." };
  }

  if (intent === "create-invite-link") {
    const result = await createInviteLink(invitesRepo, {
      householdId,
      createdByUserId: userId,
      ttlHours: 24,
    });

    return {
      message: "Link de convite gerado com sucesso.",
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  return { error: "Ação inválida." };
}

export default function HouseholdManage({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <HouseholdManagePage
      origin={loaderData.origin}
      household={loaderData.household}
      error={actionData?.error}
      message={actionData?.message}
      inviteToken={actionData?.token}
      inviteExpiresAt={actionData?.expiresAt}
    />
  );
}
