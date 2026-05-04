import { Link, useLocation } from "react-router";

import Icon from "~/ui/Icon";

export type HouseholdContext = {
  householdId: string;
  name: string;
  role: "admin" | "member";
};

type TabItem = {
  to: string;
  label: string;
  exact?: boolean;
  adminOnly?: boolean;
};

function isTabActive(tab: TabItem, currentPath: string): boolean {
  if (tab.exact) return currentPath === tab.to;
  return currentPath === tab.to || currentPath.startsWith(tab.to + "/");
}

export function HouseholdContextBar({ household }: { household: HouseholdContext }) {
  const { pathname } = useLocation();

  const tabs: TabItem[] = [
    { to: `/households/${household.householdId}`, label: "Visão geral", exact: true },
    { to: `/households/${household.householdId}/transactions`, label: "Transações" },
    { to: `/households/${household.householdId}/categories`, label: "Categorias" },
    { to: `/households/${household.householdId}/invite`, label: "Convites", adminOnly: true },
    { to: `/households/${household.householdId}/manage`, label: "Membros", adminOnly: true },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || household.role === "admin");

  return (
    <div className="md:hidden border-b border-base-300 bg-base-100">
      <div className="px-4 pt-3 pb-1">
        <Link
          to="/households"
          className="flex items-center gap-1.5 text-sm font-semibold opacity-80 hover:opacity-100"
          aria-label={`Rateio: ${household.name}. Toque para trocar.`}
        >
          <Icon name="team" className="h-4 w-4 shrink-0" />
          <span className="truncate">{household.name}</span>
        </Link>
      </div>
      <nav
        className="flex overflow-x-auto px-3 scrollbar-none"
        aria-label="Navegação do rateio"
      >
        {visibleTabs.map((tab) => {
          const active = isTabActive(tab, pathname);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              className={[
                "shrink-0 px-3 py-2 text-sm border-b-2 transition-colors whitespace-nowrap",
                active
                  ? "border-primary text-primary font-medium"
                  : "border-transparent opacity-60 hover:opacity-90",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
