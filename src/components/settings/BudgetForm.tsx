import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "../ui/form";
import DatePicker from "../form/DatePicker";
import MoneyInput from "../form/MoneyInput";

const budgetFormSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  amount: z.number(),
});

type BudgetFormFields = z.infer<typeof budgetFormSchema>;

export default function BudgetForm() {
  const form = useForm<BudgetFormFields>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      amount: 0,
    },
  });

  function onSubmit(values: BudgetFormFields) {
    console.log({ values });
  }

  return (
    <Card id="Budget" className="mb-4 w-10/12 md:w-full md:max-w-screen-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Orçamento</CardTitle>
            <CardDescription>Defina seu orçamento mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex md:items-center flex-col md:flex-row gap-4 w-full">
              <DatePicker form={form} name="startDate" label="Inicio" />
              <DatePicker form={form} name="endDate" label="Fim" />
            </div>
            <div className="grid gap-2">
              <MoneyInput
                form={form}
                name="amount"
                label="Orçamento anual"
                placeholder="R$0,00"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t p-6">
            <Button
              type="submit"
              disabled
              title="Funcionalidade ainda não está disnponível"
            >
              Salvar
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
