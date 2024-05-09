import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import PageHeader from "@/components/PageHeader";
import {
  BudgetForm,
  CategoriesForm,
  ChangePasswordForm,
} from "@/components/settings";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export const Route = createLazyFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const [active, setActive] = useState("Conta");
  return (
    <div className="h-screen w-full flex flex-col">
      <PageHeader title="Settings" />
      <main className="flex-grow flex p-8 h-5/6">
        <div className="min-w-72">
          <nav className="grid gap-4 text-gray-500 font-semibold text-sm">
            {SettingsMenuItems.map((item) => (
              <span
                key={item}
                className={active === item ? "text-gray-900" : ""}
              >
                <a href={`#${item}`} onClick={() => setActive(item)}>
                  {item}
                </a>
              </span>
            ))}
          </nav>
        </div>

        <ScrollArea className="flex-grow h-full">
          <ChangePasswordForm />
          <BudgetForm />
          <CategoriesForm />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </main>
    </div>
  );
}

const SettingsMenuItems = ["Conta", "Budget", "Categorias"];
