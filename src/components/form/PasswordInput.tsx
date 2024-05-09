import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface PasswordInputProps {
  form: UseFormReturn<any>;
  showDescription?: boolean;
  name?: string;
  label?: string;
}

export default function PasswordInput({
  form,
  name = "password",
  label = "Senha",
  showDescription = false,
}: PasswordInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input id={name} type="password" required {...field} />
          </FormControl>
          {showDescription && (
            <FormDescription>Corfime sua senha.</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
