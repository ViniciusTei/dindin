import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import EmailInput from "../form/EmailInput";
import PasswordInput from "../form/PasswordInput";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth";
import { useState } from "react";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const form = useForm<LoginForm>();

  async function onSubmit(values: LoginForm) {
    try {
      setLoading(true);
      if (values.email && values.password) {
        await signIn(values.email, values.password);
      }
    } catch (e) {
      form.setError("email", {
        type: "custom",
        message: (e as Error).message,
      });
      form.setError("password", {
        type: "custom",
        message: (e as Error).message,
      });
    } finally {
      setLoading(false);
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
        <Button type="submit" className="w-full" loading={loading}>
          Entrar
        </Button>
      </form>
    </Form>
  );
}
