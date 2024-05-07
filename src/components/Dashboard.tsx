import ExpensesTable from "@/components/ExpensesTable";
import MonthPicker from "@/components/MonthPicker";
import { formatMoney } from "@/lib/utils";
import NewTransactions from "./NewTransactions";
import { useQuery } from "@tanstack/react-query";
import getSummary from "@/services/getSummary";
import { useAuth } from "@/context/auth";
import Icon from "./ui/icon";

function Dashboard() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["summary"],
    queryFn: async () => getSummary(user!),
  });

  return (
    <main className="w-full px-8 pt-8 flex-grow flex flex-col overflow-auto">
      <section className="flex items-center justify-evenly gap-4 w-full">
        <InsightCard title="Balance" value={data?.balance} />
        <InsightCard title="Total expenses" value={data?.expense} />
        <InsightCard title="Total income" value={data?.income} />
      </section>
      <section className="mt-8 max-h-full flex-grow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Transactions</h2>
          <div className="flex items-center gap-4">
            <MonthPicker />
            <NewTransactions />
          </div>
        </div>
        <ExpensesTable />
      </section>
    </main>
  );
}

interface InsightCardProps {
  title: string;
  value?: number;
}

function InsightCard({ title, value }: InsightCardProps) {
  return (
    <div className="border border-gray-500 px-4 py-6 rounded w-full shadow-md">
      <p className="text-gray-600 text-sm">{title}</p>
      <span className="text-lg font-bold">
        {value ? formatMoney(value) : <Icon name="loading" />}
      </span>
    </div>
  );
}

export default Dashboard;
