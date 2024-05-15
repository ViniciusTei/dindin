import { useAuth } from "@/context/auth";
import { useQuery } from "@tanstack/react-query";
import { getDataByMonth } from "../firebase";
import { getMonth } from "date-fns";
import { TransactionDoc } from "../firebase/types";

export default function useAllMonthsData() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["months-reports"],
    queryFn: async () => {
      if (user) {
        const responses = await Promise.allSettled(
          meses.map((mes) => getDataByMonth(user.uid, mes)),
        );

        const result = new Map<string, any>();
        const errors = [] as string[];

        meses.forEach((m) =>
          result.set(m, {
            amount_expense: 0,
            amount_income: 0,
          }),
        );

        responses.forEach((results) => {
          if (results.status === "fulfilled") {
            results.value.forEach((doc) => {
              const d = doc.data() as TransactionDoc;
              const month = meses[getMonth(d.date.toDate())];
              if (!result.has(month)) {
                result.set(month, {
                  amount_expense: d.type === "expense" ? d.amount : 0,
                  amount_income: d.type === "income" ? d.amount : 0,
                });
              } else {
                const val = result.get(month);
                const amount = val[`amount_${d.type}`];
                result.set(month, {
                  ...val,
                  [`amount_${d.type}`]: amount + d.amount,
                });
              }
            });
          }

          if (results.status === "rejected") {
            errors.push(results.reason);
          }
        });

        if (errors.length > 0) {
          return Promise.reject(errors);
        }

        return result;
      }

      return Promise.reject("User not logged in");
    },
  });
}

const meses: string[] = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
