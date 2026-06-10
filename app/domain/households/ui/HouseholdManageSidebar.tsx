import { Link, useLocation } from "react-router";

import Icon, { type IconName } from "~/ui/Icon";

type NavItem = {
  to: string;
  label: string;
  icon: IconName;
  exact?: boolean;
};

function isNavItemActive(item: NavItem, currentPath: string): boolean {
  if (item.exact) return currentPath === item.to;
  return currentPath === item.to || currentPath.startsWith(item.to + "/");
}

type HouseholdManageSidebarProps = {
  householdId: string;
  householdName: string;
  role: "admin" | "member";
};

export function HouseholdManageSidebar(props: HouseholdManageSidebarProps) {
  const { pathname } = useLocation();

  const allItems: NavItem[] = [
    {
      to: `/households/${props.householdId}`,
      label: "Visão geral",
      icon: "dashboard",
      exact: true,
    },
    {
      to: `/households/${props.householdId}/transactions`,
      label: "Transações",
      icon: "wallet",
    },
    {
      to: `/households/${props.householdId}/categories`,
      label: "Categorias",
      icon: "categories",
    },
    {
      to: `/households/${props.householdId}/invite`,
      label: "Convites",
      icon: "invite",
    },
    {
      to: `/households/${props.householdId}/manage`,
      label: "Membros e gestão",
      icon: "admin-users",
    },
  ];

  const navItems = allItems.filter((item) => {
    if (item.label === "Convites" || item.label === "Membros e gestão") {
      return props.role === "admin";
    }
    return true;
  });

  return (
    <aside className="hidden md:flex flex-col border-r border-base-300 bg-base-200 w-64 shrink-0">
      <div className="flex h-full flex-col p-2">
        <div className="flex items-center gap-3 rounded-box p-2">
          <div className="leading-tight">
            <div className="font-semibold">{props.householdName}</div>
            <div className="text-xs opacity-70">Gerenciar</div>
          </div>
        </div>

        <nav className="mt-4 flex-1">
          <ul className="menu w-full p-0">
            {navItems.map((item) => (
              <li
                key={item.to}
                className={isNavItemActive(item, pathname) ? "active" : ""}
              >
                <Link
                  to={item.to}
                  title={item.label}
                  className="flex items-center gap-3"
                  aria-label={item.label}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-box bg-base-300 text-sm font-semibold">
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
