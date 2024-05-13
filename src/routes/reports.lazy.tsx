import PageHeader from "@/components/PageHeader";
import CategoriesChart from "@/components/reports/CategoriesChart";
import MonthlyChart from "@/components/reports/MonthlyChart";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/reports")({
  component: Reports,
});

function Reports() {
  return (
    <div className="h-screen w-full flex flex-col">
      <PageHeader title="Settings" />
      <main className="flex-grow m-4">
        <h1 className="text-lg font-bold">Relatórios de despesas</h1>
        <section className="w-full flex gap-6 flex-col md:flex-row">
          <MonthlyChart />
          <CategoriesChart />
        </section>
      </main>
    </div>
  );
}
