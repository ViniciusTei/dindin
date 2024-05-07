import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import Icon from "../components/ui/icon";
import { cn } from "../lib/utils";

function SideNav() {
  const items = useMemo(() => {
    const { pathname } = window.location;
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
  }, []);

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
              <Icon name={icon} size={28} /> <p className="text-xl">{label}</p>
            </Link>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default SideNav;
