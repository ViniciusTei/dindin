import { createLazyFileRoute } from "@tanstack/react-router";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/context/auth";
import Icon from "@/components/ui/icon";
import { UserAuth } from "@/components/auth";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  return (
    <div className="h-screen w-full flex flex-col">
      <header className="flex items-center justify-between border-b border-black px-4 py-4 text-2xl min-h-20">
        Dashboard
        <UserAuth />
      </header>

      {user ? (
        <Dashboard />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Icon name="loading" size={40} />
        </div>
      )}
    </div>
  );
}
