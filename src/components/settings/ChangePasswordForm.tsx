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
import PasswordInput from "../form/PasswordInput";

const changePasswordSchema = z
  .object({
    currentPassword: z.string({
      required_error: "Esse campo não pode ficar em branco",
    }),
    newPassword: z
      .string()
      .min(6, { message: "A senha precisa ter pelo menos 6 caracteres" }),
    confirmPassword: z
      .string()
      .min(6, { message: "A senha precisa ter pelo menos 6 caracteres" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não são iguais.",
    path: ["confirmPassword"],
  });

type ChangePasswordFields = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm() {
  const form = useForm<ChangePasswordFields>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ChangePasswordFields) {
    console.log({ values });
  }

  return (
    <Card id="Conta" className="mb-4 max-w-screen-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>
              Troque sua senha para melhorar a seguranca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordInput
              form={form}
              name="currentPassword"
              label="Senha atual"
            />
            <PasswordInput form={form} name="newPassword" label="Nova senha" />
            <PasswordInput
              form={form}
              name="confirmPassword"
              label="Confirme sua senha"
            />
          </CardContent>
          <CardFooter className="border-t p-6">
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
