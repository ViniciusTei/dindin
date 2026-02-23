import type { Route } from "./+types/home";
import { redirect } from "react-router";

import { getUser } from "~/auth/session.server";
import { usersStatsRepo } from "~/db/repositories/users-stats.repo.server";
import { HomePage } from "~/features/home/ui/HomePage";

export function meta() {
  return [
    { title: "Financeiro" },
    { name: "description", content: "Rateio mensal de despesas" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const anyUser = await usersStatsRepo.hasAnyUsers();
  if (!anyUser) return redirect("/setup");

  const user = await getUser(request);
  if (!user) return redirect("/login");

  return { user };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <HomePage username={loaderData.user.username} />;
}
