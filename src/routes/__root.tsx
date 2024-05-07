import SideNav from "@/components/SideNav";
import { AuthProvider } from "@/context/auth";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="h-full w-full flex">
          <SideNav />
          <Outlet />
          <Toaster />
        </div>
        <TanStackRouterDevtools />
      </AuthProvider>
    </QueryClientProvider>
  ),
});
