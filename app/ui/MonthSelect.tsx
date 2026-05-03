import { Link } from "react-router";
import Icon from "./Icon";

export type AvailableMonth = {
  label: string;
  link: string;
};

interface MonthSelectProps {
  monthLabel: string;
  previousLink: string;
  nextLink: string;
  availableMonths?: AvailableMonth[];
}

export default function MonthSelect({
  monthLabel,
  previousLink,
  nextLink,
  availableMonths,
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

      {availableMonths && availableMonths.length > 0 ? (
        <details className="dropdown">
          <summary role="button" className="btn btn-sm join-item capitalize">
            {monthLabel}
          </summary>
          <ul className="dropdown-content menu bg-base-100 rounded-box z-10 w-48 p-2 shadow-lg border border-base-300">
            {availableMonths.map((m) => (
              <li key={m.link}>
                <Link to={m.link} className="capitalize text-sm">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <div className="text-sm opacity-70 capitalize">{monthLabel}</div>
      )}

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
