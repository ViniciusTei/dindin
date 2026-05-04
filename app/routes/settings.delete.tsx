import type { Route } from "./+types/settings.delete";
import { redirect } from "react-router";

import { requireUser } from "~/auth/session.server";
import { logout } from "~/auth/session.server";
import { usersStatsRepo } from "~/db/repositories/users-stats.repo.server";
import { usersEraseRepo } from "~/db/repositories/users-erase.repo.server";
import { eraseUserData } from "~/domain/users/usecases/erase-user-data";

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent !== "erase") {
    return redirect("/settings?error=Ação+inválida");
  }

  await eraseUserData({ usersEraseRepo, userId: user.id });

  const anyUser = await usersStatsRepo.hasAnyUsers();
  if (!anyUser) {
    const res = await logout(request);
    return redirect("/setup", { headers: res.headers });
  }

  return logout(request);
}
