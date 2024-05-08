import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import Icon from "../components/ui/icon";
import { cn } from "../lib/utils";
import { useMediaQuery } from "@/lib/hooks";

function SideNav() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { pathname } = window.location;
  const items = useMemo(() => {
    return [
      {
        icon: "home",
        label: "Dashboard",
        route: "/",
        active: pathname === "/" ? true : false,
      },
      {
        icon: "calculator",
        label: "Transactions",
        route: "/transactions",
        active: pathname === "/transactions" ? true : false,
      },
      {
        icon: "chart-bar",
        label: "Reports",
        route: "/reports",
        active: pathname === "/reports" ? true : false,
      },
      {
        icon: "settings",
        label: "Settings",
        route: "/settings",
        active: pathname === "/settings" ? true : false,
      },
    ];
  }, [pathname]);

  if (isDesktop) {
    return (
      <div className="min-w-[300px] border-r border-black h-full">
        <div className="flex items-center justify-center gap-2 py-4 border-b border-black min-h-20">
          <Icon name="take-my-money" size={32} />{" "}
          <h1 className="text-2xl">Expense Tracker</h1>
        </div>

        <nav className="py-4 px-6">
          {items.map(({ icon, label, route, active }) => (
            <div
              key={`${icon}_${label}`}
              className={cn(
                "cursor-pointer rounded-sm p-2 mb-2",
                active && "bg-gray-200",
              )}
            >
              <Link to={route} className="flex items-center gap-2">
                <Icon name={icon} size={28} />{" "}
                <p className="text-xl">{label}</p>
              </Link>
            </div>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 w-full h-20 bg-white z-50 border-t border-t-black">
      <nav className="p-2 flex items-center justify-evenly">
        {items.map(({ icon, label, route, active }) => (
          <div
            key={`${icon}_${label}`}
            className={cn(
              "cursor-pointer rounded-sm p-2 mb-2",
              active && "bg-gray-200",
            )}
          >
            <Link to={route} className="flex items-center gap-2 flex-col">
              <Icon name={icon} size={20} /> <p className="text-xs">{label}</p>
            </Link>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default SideNav;
