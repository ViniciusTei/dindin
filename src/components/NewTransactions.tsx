import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "./ui/button";
import Icon from "./ui/icon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DatePicker from "./form/DatePicker";
import MoneyInput from "./form/MoneyInput";
import TextInput from "./form/TextInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTransaction } from "@/services/firebase";
import { useAuth } from "@/context/auth";
import { useState } from "react";

export default function NewTransactions() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Icon name="plus" className="mr-2" /> New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent handleClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Register</DialogTitle>
          <DialogDescription>Add a register of your expenses</DialogDescription>
        </DialogHeader>

        <NewTransactionForm onFinish={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

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
});

type FormData = z.infer<typeof FormSchema>;

interface NewTransactionFormProps {
  onFinish: () => void;
}

function NewTransactionForm({ onFinish }: NewTransactionFormProps) {
  const { user } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });
  const queryClient = useQueryClient();

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

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
