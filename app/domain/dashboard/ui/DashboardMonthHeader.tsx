import { Link } from "react-router";

import { formatDate } from "~/lib/datetime";
import Icon from "~/ui/Icon";

export function DashboardMonthHeader(props: {
  monthLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="join items-center gap-2 self-start sm:self-auto">
        <Link
          to={`/?month=${props.previousMonthLabel}`}
          className="btn btn-sm join-item"
          aria-label="Mês anterior"
        >
          <Icon name="arrow-left" aria-label="Anterior" />
        </Link>
        <div className="text-sm opacity-70 capitalize">
          {formatDate(props.monthLabel, { format: "long", exclude: ["day"] })}
        </div>
        <Link
          to={`/?month=${props.nextMonthLabel}`}
          className="btn btn-sm join-item"
          aria-label="Próximo mês"
        >
          <Icon name="arrow-right" aria-label="Próximo" />
        </Link>
      </div>
    </div>
  );
}
