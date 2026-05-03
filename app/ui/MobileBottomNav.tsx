import { Link } from "react-router";

import Icon, { type IconName } from "./Icon";

type NavItem = {
  to: string;
  label: string;
  icon: IconName;
};

type MobileBottomNavProps = {
  navItems: NavItem[];
  currentPath: string;
};

function isNavItemActive(itemTo: string, currentPath: string): boolean {
  if (itemTo === "/") return currentPath === "/";
  return currentPath === itemTo || currentPath.startsWith(`${itemTo}/`);
}

export function MobileBottomNav({ navItems, currentPath }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 md:hidden z-40 bg-base-200 border-t border-base-300"
      aria-label="Navegação mobile"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const active = isNavItemActive(item.to, currentPath);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={[
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs",
                active ? "text-primary" : "opacity-60",
              ].join(" ")}
            >
              <Icon name={item.icon} className="h-6 w-6" />
              <span aria-hidden>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
