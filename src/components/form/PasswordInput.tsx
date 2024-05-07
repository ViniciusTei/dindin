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
}

export default function PasswordInput({
  form,
  name = "password",
  showDescription = false,
}: PasswordInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
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
