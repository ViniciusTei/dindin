import type { Route } from "./+types/households.options";

import { requireUserId } from "~/auth/session.server";
import { householdsRepo } from "~/db/repositories/households.repo.server";
import { searchHouseholdOptions } from "~/domain/households/usecases/search-household-options";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const result = await searchHouseholdOptions({
    householdsRepo,
    userId,
    query: String(url.searchParams.get("q") ?? ""),
    recommendedHouseholdId: url.searchParams.get("recommendedHouseholdId"),
  });

  return new Response(JSON.stringify(result), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export default function HouseholdOptionsResource() {
  return null;
}
