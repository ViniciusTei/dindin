import type { AvailableMonth } from "~/ui/MonthSelect";
import MonthSelect from "~/ui/MonthSelect";
import { formatDate } from "~/lib/datetime";

export function DashboardMonthHeader(props: {
  monthLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  availableMonths?: AvailableMonth[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      <MonthSelect
        monthLabel={formatDate(props.monthLabel, {
          format: "long",
          exclude: ["day"],
        })}
        previousLink={`/?month=${props.previousMonthLabel}`}
        nextLink={`/?month=${props.nextMonthLabel}`}
        availableMonths={props.availableMonths}
      />
    </div>
  );
}
