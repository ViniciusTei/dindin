import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

import { useTheme } from "~/contexts/ThemeContext";
import { useSidebar } from "~/contexts/SidebarContext";

import { DesktopSidebar } from "./DesktopSidebar";
import type { IconName } from "./Icon";
import Icon from "./Icon";
import { MobileBottomNav } from "./MobileBottomNav";

type AppShellUser = {
  username: string;
  isAdmin: boolean;
};

export function AppShell(props: {
  user: AppShellUser;
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
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

  const shellGridCols = isSidebarCollapsed
    ? "grid-cols-1 md:grid-cols-[4rem_repeat(4,minmax(0,1fr))]"
    : "grid-cols-1 md:grid-cols-[16rem_repeat(4,minmax(0,1fr))]";

  const navItems = useMemo(() => {
    const items: Array<{
      to: string;
      label: string;
      icon: IconName;
      visible: boolean;
    }> = [
      { to: "/", label: "Dashboard", icon: "dashboard", visible: true },
      { to: "/households", label: "Rateios", icon: "team", visible: true },
      { to: "/accounts", label: "Contas", icon: "bank", visible: true },
      { to: "/cards", label: "Cartões", icon: "credit-card", visible: true },
      {
        to: "/settings",
        label: "Configurações",
        icon: "settings",
        visible: true,
      },
    ];
    return items.filter((i) => i.visible);
  }, []);

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
        currentPath={`${location.pathname}${location.search}`}
      />

      <header className="row-start-1 row-end-2 col-start-1 col-end-2 md:col-start-2 md:col-end-6 border-b border-base-300 bg-base-100">
        <div className="flex h-full items-center justify-between px-4">
          <button
            type="button"
            className="hidden md:inline-flex btn btn-ghost btn-square"
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            <Icon
              name={isSidebarCollapsed ? "menu-unfold" : "menu-fold"}
              className="h-4 w-4"
            />
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
                name={
                  theme === "sunset"
                    ? ("sun" as IconName)
                    : ("moon" as IconName)
                }
                className="h-4 w-4"
              />
            </button>
            {isOnline ? null : (
              <span
                className="badge badge-warning"
                title="Offline (somente leitura)"
              >
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
