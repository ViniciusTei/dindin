import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import useDataByCategorie from "@/services/reports/useDataByCategorie";
import Icon from "../ui/icon";
import { getColors } from "@/lib/utils";

ChartJS.register(ArcElement, Title, Tooltip, Legend);

export default function CategoriesChart() {
  const { data } = useDataByCategorie();

  return (
    <div className="flex-grow max-w-md self-center">
      {data ? (
        <Doughnut
          options={{
            plugins: { title: { display: true, text: "Saldos por categoria" } },
          }}
          data={{
            labels: Object.keys(data),
            datasets: [
              {
                label: "Gastos por categoria",
                data: Object.values(data),
                backgroundColor: getColors(Object.values(data).length),
                borderColor: getColors(Object.values(data).length),
                borderWidth: 1,
              },
            ],
          }}
        />
      ) : (
        <div className="w-96 self-center flex items-center justify-center">
          <Icon name="loading" size={40} />
        </div>
      )}
    </div>
  );
}
