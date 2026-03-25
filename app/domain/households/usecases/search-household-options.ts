import type { HouseholdAccess } from "~/domain/households/entity";
import type { HouseholdsRepo } from "~/domain/households/ports";

export type HouseholdSwitcherOption = HouseholdAccess & {
  recommended: boolean;
};

function normalizeSearchTerm(value: string): string {
  return value.trim().slice(0, 60).toLocaleLowerCase("pt-BR");
}

export function filterHouseholdOptions(params: {
  households: HouseholdAccess[];
  query: string;
  recommendedHouseholdId?: string | null;
  limit?: number;
}): {
  options: HouseholdSwitcherOption[];
  recommendedHouseholdId: string | null;
} {
  const normalizedQuery = normalizeSearchTerm(params.query);
  const recommendedHouseholdId =
    params.households.find(
      (household) => household.householdId === params.recommendedHouseholdId,
    )?.householdId ??
    params.households[0]?.householdId ??
    null;

  const filtered = params.households
    .filter((household) => {
      if (!normalizedQuery) return true;

      return household.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery);
    })
    .sort((left, right) => {
      const leftRecommended = left.householdId === recommendedHouseholdId ? 1 : 0;
      const rightRecommended =
        right.householdId === recommendedHouseholdId ? 1 : 0;

      if (leftRecommended !== rightRecommended) {
        return rightRecommended - leftRecommended;
      }

      return left.name.localeCompare(right.name, "pt-BR");
    })
    .slice(0, params.limit ?? 20)
    .map((household) => ({
      ...household,
      recommended: household.householdId === recommendedHouseholdId,
    }));

  return {
    options: filtered,
    recommendedHouseholdId,
  };
}

export async function searchHouseholdOptions(params: {
  householdsRepo: HouseholdsRepo;
  userId: string;
  query: string;
  recommendedHouseholdId?: string | null;
  limit?: number;
}) {
  const households = await params.householdsRepo.listForUser(params.userId);
  return filterHouseholdOptions({
    households,
    query: params.query,
    recommendedHouseholdId: params.recommendedHouseholdId,
    limit: params.limit,
  });
}
