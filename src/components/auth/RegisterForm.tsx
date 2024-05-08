import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import EmailInput from "@/components/form/EmailInput";
import PasswordInput from "@/components/form/PasswordInput";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";

type RegisterForm = {
  email: string;
  password: string;
  confirm_password: string;
};

export default function RegisterForm() {
  const { signUp } = useAuth();
  const form = useForm<RegisterForm>();

  function onSubmit(values: RegisterForm) {
    if (values.email && values.password && values.confirm_password) {
      signUp(values.email, values.password);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 md:mx-16"
      >
        <EmailInput form={form} />
        <PasswordInput form={form} />
        <PasswordInput form={form} name="confirm_password" showDescription />
        <Button type="submit" className="w-full">
          Registrar
        </Button>
      </form>
    </Form>
  );
}
