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
import { formatMoney } from "@/lib/utils";
import Icon from "./ui/icon";
import { displayDate } from "@/lib/dateUtils";

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
      <TableCaption>Lista com suas despesas recentes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Categoria</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data &&
          data.map(({ date, type, amount, description, id, category }) => (
            <TableRow key={id}>
              <TableCell className="font-medium">{displayDate(date)}</TableCell>
              <TableCell>{description}</TableCell>
              <TableCell>{formatMoney(amount)}</TableCell>
              <TableCell>
                {type === "expense" ? (
                  <Badge variant="destructive">Expense</Badge>
                ) : (
                  <Badge variant="default">Income</Badge>
                )}
              </TableCell>
              <TableCell>{category}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
