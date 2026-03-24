import { Form, Link, useLocation } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "~/contexts/ThemeContext";
import { HouseholdSwitcher } from "~/domain/households/ui/HouseholdSwitcher";
import Icon, { type IconName } from "./Icon";

type AppShellHousehold = {
  householdId: string;
  name: string;
  role: "admin" | "member";
};

type AppShellUser = {
  username: string;
  isAdmin: boolean;
  households: AppShellHousehold[];
  defaultHouseholdId: string | null;
  preferredHouseholdId: string | null;
};

export function AppShell(props: {
  user: AppShellUser;
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [preferredHouseholdId, setPreferredHouseholdId] = useState(
    props.user.preferredHouseholdId ?? props.user.defaultHouseholdId,
  );
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    function onOnline() {
      setIsOnline(true);
    }
    function onOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    setPreferredHouseholdId(
      props.user.preferredHouseholdId ?? props.user.defaultHouseholdId,
    );
  }, [props.user.defaultHouseholdId, props.user.preferredHouseholdId]);

  const shellGridCols = isSidebarCollapsed
    ? "grid-cols-[4rem_repeat(4,minmax(0,1fr))]"
    : "grid-cols-[16rem_repeat(4,minmax(0,1fr))]";

  const activeHouseholdId = useMemo(() => {
    const match = location.pathname.match(/^\/households\/([^/]+)/);
    return match?.[1] ?? preferredHouseholdId ?? props.user.defaultHouseholdId;
  }, [location.pathname, preferredHouseholdId, props.user.defaultHouseholdId]);

  const activeHousehold = useMemo(
    () =>
      props.user.households.find((household) => household.householdId === activeHouseholdId) ?? null,
    [activeHouseholdId, props.user.households]
  );

  const navItems = useMemo(() => {
    const items: Array<{
      to: string;
      label: string;
      icon: IconName;
      visible: boolean;
    }> = [
      { to: "/", label: "Dashboard", icon: "dashboard", visible: true },
      { to: "/households", label: "Households", icon: "heart", visible: true },
      { to: "/accounts", label: "Contas", icon: "bank", visible: true },
      { to: "/cards", label: "Cartões", icon: "credit-card", visible: true },
      { to: "/account", label: "Conta", icon: "account", visible: true },
    ];

    return items.filter((i) => i.visible);
  }, []);

  const householdNavItems = useMemo(() => {
    if (!activeHousehold) return [];

    const items: Array<{
      to: string;
      label: string;
      icon: IconName;
      visible: boolean;
    }> = [
      {
        to: `/households/${activeHousehold.householdId}`,
        label: "Visão geral",
        icon: "dashboard",
        visible: true,
      },
      {
        to: `/households/${activeHousehold.householdId}/transactions`,
        label: "Transações",
        icon: "wallet",
        visible: true,
      },
      {
        to: `/households/${activeHousehold.householdId}/categories`,
        label: "Categorias",
        icon: "categories",
        visible: true,
      },
      {
        to: `/households/${activeHousehold.householdId}/invite`,
        label: "Convites",
        icon: "invite",
        visible: activeHousehold.role === "admin",
      },
      {
        to: `/households/${activeHousehold.householdId}/manage`,
        label: "Membros e gestão",
        icon: "admin-users",
        visible: activeHousehold.role === "admin",
      },
    ];

    return items.filter((item) => item.visible);
  }, [activeHousehold]);

  return (
    <div
      className={[
        "min-h-dvh",
        "grid",
        "grid-rows-[3.5rem_repeat(4,minmax(0,1fr))]",
        shellGridCols,
      ].join(" ")}
    >
      <aside className="row-start-1 row-end-6 col-start-1 col-end-2 border-r border-base-300 bg-base-200">
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
              {navItems.map((item) => (
                <li key={item.to}>
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

              {!isSidebarCollapsed && activeHousehold ? (
                <li className="menu-title mt-4 px-3 text-xs uppercase opacity-60">
                  <span>Household ativa</span>
                </li>
              ) : null}

              {!isSidebarCollapsed && activeHousehold ? (
                <li className="mb-1 px-3 pb-2 text-sm">
                  <HouseholdSwitcher
                    households={props.user.households}
                    activeHouseholdId={activeHousehold.householdId}
                    recommendedHouseholdId={
                      preferredHouseholdId ?? props.user.defaultHouseholdId
                    }
                    currentPath={`${location.pathname}${location.search}`}
                    onActiveHouseholdChange={setPreferredHouseholdId}
                  />
                </li>
              ) : null}

              {householdNavItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    title={item.label}
                    className={[
                      "flex items-center",
                      isSidebarCollapsed ? "justify-center" : "justify-start pl-6",
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

      <header className="row-start-1 row-end-2 col-start-2 col-end-6 border-b border-base-300 bg-base-100">
        <div className="flex h-full items-center justify-between px-4">
          <button
            type="button"
            className="btn btn-ghost btn-square"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            aria-label={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isSidebarCollapsed ? "»" : "«"}
          </button>

          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              className="btn btn-ghost btn-square"
              onClick={toggleTheme}
              aria-label={theme === "sunset" ? "Ativar tema claro" : "Ativar tema escuro"}
              title={theme === "sunset" ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              <Icon
                name={theme === "sunset" ? ("sun" as IconName) : ("moon" as IconName)}
                className="h-4 w-4"
              />
            </button>
            {isOnline ? null : (
              <span className="badge badge-warning" title="Offline (somente leitura)">
                Offline — somente leitura
              </span>
            )}
            <span className="opacity-70">Usuário: </span>
            <span className="font-medium">{props.user.username}</span>
          </div>
        </div>
      </header>

      <main className="row-start-2 row-end-6 col-start-2 col-end-6 min-h-0 overflow-y-auto">
        {props.children}
      </main>
    </div>
  );
}
