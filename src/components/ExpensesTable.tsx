import { useQuery } from "@tanstack/react-query";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { getTransactions } from "@/services/firebase";
import { useAuth } from "@/context/auth";
import { format } from "date-fns";
import { formatMoney } from "@/lib/utils";
import Icon from "./ui/icon";

export default function ExpensesTable() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => await getTransactions(user!),
  });

  if (isLoading) {
    return <Icon name="loading" size={24} />;
  }

  return (
    <Table className="max-h-full overflow-auto">
      <TableCaption>A list of your recent expenses.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data &&
          data.map(({ date, type, amount, description, id }) => (
            <TableRow key={id}>
              <TableCell className="font-medium">
                {format(date, "LLL dd, yyyy")}
              </TableCell>
              <TableCell>{description}</TableCell>
              <TableCell>{formatMoney(amount)}</TableCell>
              <TableCell>
                {type === "expense" ? (
                  <Badge variant="destructive">Expense</Badge>
                ) : (
                  <Badge variant="default">Income</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
