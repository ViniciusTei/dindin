import { useAuth } from "@/context/auth";
import { useQuery } from "@tanstack/react-query";
import { getDataByMonth } from "../firebase";
import { getMonth } from "date-fns";

export default function useAllMonthsData() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["months-reports"],
    queryFn: async () => {
      if (user) {
        const responses = await Promise.allSettled(
          meses.map((mes) => getDataByMonth(user.uid, mes)),
        );

        const result: { month: string; amount: number; type: string }[] = [];
        responses.forEach((results) => {
          if (results.status === "fulfilled") {
            results.value.forEach((doc) => {
              const d = doc.data();
              const v = {
                month: meses[getMonth(new Date(d.date))],
                amount: d.amount,
                type: d.type,
              };
              result.push(v);
            });
          }
        });
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
