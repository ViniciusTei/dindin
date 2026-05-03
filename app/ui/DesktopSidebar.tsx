import { Form, Link } from "react-router";

import { HouseholdSwitcher } from "~/domain/households/ui/HouseholdSwitcher";

import Icon, { type IconName } from "./Icon";

export type AppShellHousehold = {
  householdId: string;
  name: string;
  role: "admin" | "member";
};

type NavItem = {
  to: string;
  label: string;
  icon: IconName;
};

type DesktopSidebarProps = {
  isSidebarCollapsed: boolean;
  navItems: NavItem[];
  householdNavItems: NavItem[];
  activeHousehold: AppShellHousehold | null;
  households: AppShellHousehold[];
  preferredHouseholdId: string | null;
  defaultHouseholdId: string | null;
  currentPath: string;
  onActiveHouseholdChange: (id: string) => void;
};

function isNavItemActive(itemTo: string, currentPath: string): boolean {
  if (itemTo === "/") return currentPath === "/" || currentPath === "";
  return currentPath.startsWith(itemTo);
}

export function DesktopSidebar(props: DesktopSidebarProps) {
  const { isSidebarCollapsed } = props;

  return (
    <aside className="hidden md:flex row-start-1 row-end-6 col-start-1 col-end-2 flex-col border-r border-base-300 bg-base-200">
      <div className="flex h-full flex-col p-2">
        <Link
          to="/"
          className={[
            "flex items-center gap-3 rounded-box p-2",
            isSidebarCollapsed ? "justify-center" : "justify-start",
            "hover:bg-base-300",
          ].join(" ")}
        >
          <div className="avatar">
            <div className="w-10 rounded">
              <img src="/site-icon.png" alt="Financeiro" />
            </div>
          </div>
          {isSidebarCollapsed ? null : (
            <div className="leading-tight">
              <div className="font-semibold">Financeiro</div>
              <div className="text-xs opacity-70">Controle Financeiro</div>
            </div>
          )}
        </Link>

        <nav className="mt-4 flex-1">
          <ul className="menu w-full p-0">
            {props.navItems.map((item) => (
              <li key={item.to} className={isNavItemActive(item.to, props.currentPath) ? "active" : ""}>
                <Link
                  to={item.to}
                  title={item.label}
                  className={[
                    "flex items-center",
                    isSidebarCollapsed ? "justify-center" : "justify-start",
                    "gap-3",
                  ].join(" ")}
                  aria-label={item.label}
                >
                  <span
                    className={[
                      "inline-flex h-8 w-8 items-center justify-center rounded-box",
                      "bg-base-300",
                      "text-sm font-semibold",
                    ].join(" ")}
                    aria-hidden={true}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  {isSidebarCollapsed ? null : <span>{item.label}</span>}
                </Link>
              </li>
            ))}

            {props.activeHousehold ? (
              <li className="mt-2 mb-1">
                <div className="border-t border-base-300 pt-2">
                  {!isSidebarCollapsed ? (
                    <span className="px-1 text-xs uppercase opacity-60">Rateio ativo</span>
                  ) : null}
                </div>
              </li>
            ) : null}

            {!isSidebarCollapsed && props.activeHousehold ? (
              <li className="mb-1 px-3 pb-2 text-sm">
                <HouseholdSwitcher
                  households={props.households}
                  activeHouseholdId={props.activeHousehold.householdId}
                  recommendedHouseholdId={
                    props.preferredHouseholdId ?? props.defaultHouseholdId
                  }
                  currentPath={props.currentPath}
                  onActiveHouseholdChange={props.onActiveHouseholdChange}
                />
              </li>
            ) : null}

            {props.householdNavItems.map((item) => (
              <li key={item.to} className={isNavItemActive(item.to, props.currentPath) ? "active" : ""}>
                <Link
                  to={item.to}
                  title={item.label}
                  className={[
                    "flex items-center",
                    isSidebarCollapsed
                      ? "justify-center"
                      : "justify-start pl-6",
                    "gap-3",
                  ].join(" ")}
                  aria-label={item.label}
                >
                  <span
                    className={[
                      "inline-flex h-8 w-8 items-center justify-center rounded-box",
                      "bg-base-300",
                      "text-sm font-semibold",
                    ].join(" ")}
                    aria-hidden={true}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  {isSidebarCollapsed ? null : <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-2">
          <Form method="post" action="/logout">
            <button
              type="submit"
              className={[
                "btn btn-ghost w-full",
                isSidebarCollapsed ? "btn-square mx-auto" : "justify-start",
              ].join(" ")}
              title="Sair"
            >
              {isSidebarCollapsed ? (
                <Icon name="logout" className="h-4 w-4" />
              ) : (
                <>
                  <Icon name="logout" className="h-4 w-4" />
                  <span>Sair</span>
                </>
              )}
            </button>
          </Form>
        </div>
      </div>
    </aside>
  );
}
