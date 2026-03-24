import { useEffect, useMemo, useState } from "react";
import { useFetcher, useNavigate } from "react-router";

import type { MembershipRole } from "~/domain/households/entity";

type HouseholdSwitcherOption = {
  householdId: string;
  name: string;
  role: MembershipRole;
  recommended: boolean;
};

type HouseholdSwitcherActionData =
  | {
      ok: true;
      householdId: string;
      redirectTo: string;
    }
  | {
      ok: false;
      error: string;
    };

function formatRole(role: MembershipRole): string {
  return role === "admin" ? "Administrador" : "Membro";
}

function buildFallbackOptions(params: {
  households: Array<{
    householdId: string;
    name: string;
    role: MembershipRole;
  }>;
  recommendedHouseholdId: string | null;
}): HouseholdSwitcherOption[] {
  return [...params.households]
    .sort((left, right) => {
      const leftRecommended =
        left.householdId === params.recommendedHouseholdId ? 1 : 0;
      const rightRecommended =
        right.householdId === params.recommendedHouseholdId ? 1 : 0;

      if (leftRecommended !== rightRecommended) {
        return rightRecommended - leftRecommended;
      }

      return left.name.localeCompare(right.name, "pt-BR");
    })
    .map((household) => ({
      ...household,
      recommended: household.householdId === params.recommendedHouseholdId,
    }));
}

export function HouseholdSwitcher(props: {
  households: Array<{
    householdId: string;
    name: string;
    role: MembershipRole;
  }>;
  activeHouseholdId: string | null;
  recommendedHouseholdId: string | null;
  currentPath: string;
  onActiveHouseholdChange: (householdId: string) => void;
}) {
  const switchFetcher = useFetcher<HouseholdSwitcherActionData>();
  const navigate = useNavigate();
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(
    props.activeHouseholdId ?? "",
  );

  useEffect(() => {
    setSelectedHouseholdId(props.activeHouseholdId ?? "");
  }, [props.activeHouseholdId]);

  const options = useMemo(
    () =>
      buildFallbackOptions({
        households: props.households,
        recommendedHouseholdId: props.recommendedHouseholdId,
      }),
    [props.households, props.recommendedHouseholdId],
  );

  useEffect(() => {
    const result = switchFetcher.data;
    if (!result || !result.ok) return;

    setSelectedHouseholdId(result.householdId);
    props.onActiveHouseholdChange(result.householdId);

    if (result.redirectTo !== props.currentPath) {
      navigate(result.redirectTo);
    }
  }, [
    navigate,
    props.currentPath,
    props.onActiveHouseholdChange,
    switchFetcher.data,
  ]);

  if (props.households.length === 0) {
    return null;
  }

  return (
    <>
      <select
        id="household-switcher-select"
        className="select select-bordered select-sm mt-2 w-full"
        aria-label="Selecionar household ativa"
        value={selectedHouseholdId}
        disabled={options.length === 0 || switchFetcher.state !== "idle"}
        onChange={(event) => {
          const householdId = event.currentTarget.value;
          if (!householdId || householdId === selectedHouseholdId) return;

          setSelectedHouseholdId(householdId);
          const formData = new FormData();
          formData.set("householdId", householdId);
          formData.set("currentPath", props.currentPath);
          switchFetcher.submit(formData, {
            action: "/api/households/active",
            method: "post",
          });
        }}
      >
        {options.map((option) => (
          <option key={option.householdId} value={option.householdId}>
            {`${option.name} — ${formatRole(option.role)}${
              option.recommended ? " (recomendada)" : ""
            }`}
          </option>
        ))}
      </select>

      {switchFetcher.data && !switchFetcher.data.ok ? (
        <div role="alert" className="alert alert-error mt-2 py-2 text-xs">
          <span>{switchFetcher.data.error}</span>
        </div>
      ) : null}
    </>
  );
}
