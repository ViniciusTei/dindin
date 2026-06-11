import { createContext, useContext, useState } from "react";

type SidebarContextValue = {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider(props: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  function toggleSidebar() {
    setIsSidebarCollapsed((s: boolean) => !s);
  }

  return (
    <SidebarContext.Provider
      value={{ isSidebarCollapsed, setIsSidebarCollapsed, toggleSidebar }}
    >
      {props.children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}
