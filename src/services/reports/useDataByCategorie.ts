import { useAuth } from "@/context/auth";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../firebase";

export default function useDataByCategorie() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["categories-reports"],
    queryFn: async () => {
      if (user) {
        const data = await getTransactions(user);
        const resultCategories = data
          .filter((d) => d.type === "expense")
          .map((d) => d.category);
        const result: { [key: string]: number } = {};

        resultCategories.forEach((category) => {
          result[category] = data
            .filter((d) => d.category === category)
            .reduce((acc, val) => {
              return acc + val.amount;
            }, 0);
        });

        return result;
      }

      return Promise.reject("User not logged in");
    },
  });
}
