import type { Route } from "./+types/categories";
import { redirect } from "react-router";

import { getDefaultHouseholdRouteForUser } from "~/auth/household.server";
import { requireUserId } from "~/auth/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  return redirect(await getDefaultHouseholdRouteForUser({ userId, suffix: "/categories" }));
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  return redirect(await getDefaultHouseholdRouteForUser({ userId, suffix: "/categories" }));
}

export default function CategoriesLegacyRedirect() {
  return null;
}
