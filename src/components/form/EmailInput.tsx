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

interface EmailInputProps {
  form: UseFormReturn<any>;
  showDescription?: boolean;
}

export default function EmailInput({
  form,
  showDescription = false,
}: EmailInputProps) {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              {...field}
            />
          </FormControl>
          {showDescription && (
            <FormDescription>
              Esse é o e-mail utilizado para entrar na aplicação.
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
