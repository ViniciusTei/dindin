import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DatePicker from "@/components/form/DatePicker";
import MoneyInput from "@/components/form/MoneyInput";
import TextInput from "@/components/form/TextInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTransaction } from "@/services/firebase";
import { useAuth } from "@/context/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import useUserCategoriesQuery from "@/services/user/useUserCategories";

const FormSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "You need to select a type.",
  }),
  description: z.string({
    required_error: "You need to add a description",
  }),
  amount: z.number({
    required_error: "You need to add a amount",
  }),
  date: z.date(),
  category: z.string({
    required_error: "You need to add a category",
  }),
});

type FormData = z.infer<typeof FormSchema>;

interface NewTransactionFormProps {
  onFinish: () => void;
}

export default function NewTransactionForm({
  onFinish,
}: NewTransactionFormProps) {
  const { user } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });
  const queryClient = useQueryClient();
  const { data, isLoading } = useUserCategoriesQuery();

  const mutation = useMutation({
    mutationFn: async (values: FormData) => await addTransaction(user!, values),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["transactions"] });
      queryClient.refetchQueries({ queryKey: ["summary"] });

      toast({
        title: "Yeah!",
        description: "You submitted new values with sucess!",
      });

      onFinish();
    },
    onError: (err) => {
      toast({
        title: "Oh no!",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-2/3 space-y-6 mx-auto"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="income" />
                    </FormControl>
                    <FormLabel className="font-normal">Income</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="expense" />
                    </FormControl>
                    <FormLabel className="font-normal">Expenses</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TextInput form={form} name="description" label="Description" />

        <DatePicker form={form} name="date" label="Date" />

        <MoneyInput
          form={form}
          name="amount"
          label="Amount"
          placeholder="R$00,00"
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Categoria</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {data &&
                    data.map((category) => (
                      <SelectItem value={category}>{category}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
