import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

import { useTheme } from "~/contexts/ThemeContext";

import { DesktopSidebar, type AppShellHousehold } from "./DesktopSidebar";
import Icon, { type IconName } from "./Icon";
import { MobileBottomNav } from "./MobileBottomNav";

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
    ? "grid-cols-1 md:grid-cols-[4rem_repeat(4,minmax(0,1fr))]"
    : "grid-cols-1 md:grid-cols-[16rem_repeat(4,minmax(0,1fr))]";

  const activeHouseholdId = useMemo(() => {
    const match = location.pathname.match(/^\/households\/([^/]+)/);
    return match?.[1] ?? preferredHouseholdId ?? props.user.defaultHouseholdId;
  }, [location.pathname, preferredHouseholdId, props.user.defaultHouseholdId]);

  const activeHousehold = useMemo(
    () =>
      props.user.households.find(
        (household) => household.householdId === activeHouseholdId,
      ) ?? null,
    [activeHouseholdId, props.user.households],
  );

  const navItems = useMemo(() => {
    const items: Array<{
      to: string;
      label: string;
      icon: IconName;
      visible: boolean;
    }> = [
      { to: "/", label: "Dashboard", icon: "dashboard", visible: true },
      { to: "/households", label: "Rateios", icon: "heart", visible: true },
      { to: "/accounts", label: "Contas", icon: "bank", visible: true },
      { to: "/cards", label: "Cartões", icon: "credit-card", visible: true },
      { to: "/settings", label: "Configurações", icon: "settings", visible: true },
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
      <DesktopSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        navItems={navItems}
        householdNavItems={householdNavItems}
        activeHousehold={activeHousehold}
        households={props.user.households}
        preferredHouseholdId={preferredHouseholdId}
        defaultHouseholdId={props.user.defaultHouseholdId}
        currentPath={`${location.pathname}${location.search}`}
        onActiveHouseholdChange={setPreferredHouseholdId}
      />

      <header className="row-start-1 row-end-2 col-start-1 col-end-2 md:col-start-2 md:col-end-6 border-b border-base-300 bg-base-100">
        <div className="flex h-full items-center justify-between px-4">
          <button
            type="button"
            className="hidden md:inline-flex btn btn-ghost btn-square"
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
              aria-label={
                theme === "sunset" ? "Ativar tema claro" : "Ativar tema escuro"
              }
              title={
                theme === "sunset" ? "Ativar tema claro" : "Ativar tema escuro"
              }
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

      <main className="row-start-2 row-end-6 col-start-1 col-end-2 md:col-start-2 md:col-end-6 min-h-0 overflow-y-auto pb-20 md:pb-0">
        {props.children}
      </main>

      <MobileBottomNav navItems={navItems} currentPath={location.pathname} />
    </div>
  );
}
