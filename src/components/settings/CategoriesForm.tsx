import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import useUserCategoriesQuery from "@/services/user/useUserCategories";
import Icon from "../ui/icon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import addUserCategories from "@/services/user/addUserCategories";
import { useAuth } from "@/context/auth";
import { useToast } from "../ui/use-toast";
import { useRef } from "react";

export default function CategoriesForm() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data, isLoading } = useUserCategoriesQuery();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async (values: string[]) =>
      await addUserCategories(user!.uid, values),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [`${user?.uid ?? "users"}-categories`],
      });

      toast({
        title: "Sucesso!",
        description: "A nova categoria foi adicionada com sucesso!",
      });
    },
    onError: (err) => {
      toast({
        title: "Ah não!",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit() {
    if (!inputRef.current) {
      console.log("input not foud");
      return;
    }
    if (!inputRef.current.value) {
      console.log("value not found");
      return;
    }
    if (data) {
      mutation.mutate([...data, inputRef.current.value]);
    } else {
      mutation.mutate([inputRef.current.value]);
    }
  }

  return (
    <Card id="Categorias" className="mb-4 w-10/12 md:w-full md:max-w-screen-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Categorias {isLoading && <Icon name="loading" size={16} />}
        </CardTitle>
        <CardDescription>Gerencie suas categorias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="categories">Suas categorias</Label>
            <Textarea
              className="min-h-[100px]"
              defaultValue={data?.join(", ")}
              id="categories"
              placeholder="Rent, Groceries, Utilities, Transportation, Entertainment"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newCategory">Adicionar</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                id="newCategory"
                placeholder="Digite a nova categoria"
              />
              <Button onClick={onSubmit} loading={mutation.isPending}>
                <Icon name="plus" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
