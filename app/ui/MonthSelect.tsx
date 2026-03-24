import { Link } from "react-router";
import Icon from "./Icon";

interface MonthSelectProps {
  monthLabel: string;
  previousLink: string;
  nextLink: string;
}

export default function MonthSelect({
  monthLabel,
  previousLink,
  nextLink,
}: MonthSelectProps) {
  return (
    <div className="join items-center gap-2 self-start sm:self-auto">
      <Link
        to={previousLink}
        className="btn btn-sm join-item"
        aria-label="Mês anterior"
      >
        <Icon name="arrow-left" aria-label="Anterior" />
      </Link>
      <div className="text-sm opacity-70 capitalize">{monthLabel}</div>
      <Link
        to={nextLink}
        className="btn btn-sm join-item"
        aria-label="Próximo mês"
      >
        <Icon name="arrow-right" aria-label="Próximo" />
      </Link>
    </div>
  );
}
