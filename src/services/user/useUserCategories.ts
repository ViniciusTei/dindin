import { useAuth } from "@/context/auth";
import { useQuery } from "@tanstack/react-query";
import getUserCategories from "./getUserCategories";

export default function useUserCategoriesQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [`${user?.uid ?? "users"}-categories`],
    queryFn: async () => {
      if (user) {
        return await getUserCategories(user?.uid);
      }

      return Promise.reject("User not logged in");
    },
  });
}
