import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

const months = [
  { nome: "Janeiro", abreviacao: "Jan" },
  { nome: "Fevereiro", abreviacao: "Fev" },
  { nome: "Março", abreviacao: "Mar" },
  { nome: "Abril", abreviacao: "Abr" },
  { nome: "Maio", abreviacao: "Mai" },
  { nome: "Junho", abreviacao: "Jun" },
  { nome: "Julho", abreviacao: "Jul" },
  { nome: "Agosto", abreviacao: "Ago" },
  { nome: "Setembro", abreviacao: "Set" },
  { nome: "Outubro", abreviacao: "Out" },
  { nome: "Novembro", abreviacao: "Nov" },
  { nome: "Dezembro", abreviacao: "Dez" },
];

function MonthPicker() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="This month" />
      </SelectTrigger>
      <SelectContent>
        {months.map(({ nome, abreviacao }) => (
          <SelectItem key={abreviacao} value={abreviacao}>
            {nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default MonthPicker;
