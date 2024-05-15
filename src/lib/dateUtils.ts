import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function displayDate(date: Date): string {
  return format(date, "LLL dd, yyyy", { locale: ptBR });
}
