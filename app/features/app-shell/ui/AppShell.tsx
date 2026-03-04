import { Form, Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import Icon, { type IconName } from "~/components/Icon";

type AppShellUser = {
  username: string;
  isAdmin: boolean;
};

export function AppShell(props: {
  user: AppShellUser;
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

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
    ? "grid-cols-[4rem_repeat(4,minmax(0,1fr))]"
    : "grid-cols-[16rem_repeat(4,minmax(0,1fr))]";

  const navItems = useMemo(() => {
    const items: Array<{
      to: string;
      label: string;
      icon: IconName;
      visible: boolean;
    }> = [
      { to: "/", label: "Dashboard", icon: "dashboard", visible: true },
      { to: "/months", label: "Meses", icon: "months", visible: true },
      { to: "/invite", label: "Convite", icon: "invite", visible: true },
      { to: "/accounts", label: "Contas", icon: "wallet", visible: true },
      { to: "/transactions", label: "Transações", icon: "months", visible: true },
      { to: "/account", label: "Conta", icon: "account", visible: true },
      { to: "/categories", label: "Categorias", icon: "categories", visible: true },
      {
        to: "/admin/users",
        label: "Admin: usuários",
        icon: "admin-users",
        visible: props.user.isAdmin,
      },
    ];

    return items.filter((i) => i.visible);
  }, [props.user.isAdmin]);

  return (
    <div
      className={[
        "min-h-dvh",
        "grid",
        "grid-rows-[3.5rem_repeat(4,minmax(0,1fr))]",
        shellGridCols,
      ].join(" ")}
    >
      {/* Sidebar */}
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
                <div className="text-xs opacity-70">Rateio financeiro</div>
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
                      <Icon name={item.icon} size={16} />
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
                  <Icon name="logout" size={16} />
                ) : (
                  <>
                  <Icon name="logout" size={16} />
                  <span>Sair</span></> 
                )}
              </button>
            </Form>
          </div>
        </div>
      </aside>

      {/* Header */}
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

      {/* Main */}
      <main className="row-start-2 row-end-6 col-start-2 col-end-6 min-h-0 overflow-y-auto">
        {props.children}
      </main>
    </div>
  );
}
