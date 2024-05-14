import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useAllMonthsData from "@/services/reports/useAllMonthsData";
import { useMemo } from "react";
import Icon from "../ui/icon";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "right" as const,
    },
    title: {
      display: true,
      text: "Saldos por mês",
    },
  },
};

const labels = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function MonthlyChart() {
  const { data } = useAllMonthsData();

  const charData = useMemo(() => {
    if (data) {
      return {
        labels,
        datasets: [
          {
            label: "Despesas",
            data: data.map((report) => {
              let value = 0;
              if (report.type === "expense") {
                value += report.amount;
              }
              return value;
            }),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
          {
            label: "Receitas",
            data: data.map((report) => {
              let value = 0;
              if (report.type === "income") {
                value += report.amount;
              }
              return value;
            }),
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
          },
        ],
      };
    }
  }, [data]);

  return (
    <div className="max-w-sm flex-grow self-center md:max-w-screen-sm">
      {charData ? (
        <Bar options={options} data={charData} />
      ) : (
        <div className="w-96 self-center flex items-center justify-center">
          <Icon name="loading" size={40} />
        </div>
      )}
    </div>
  );
}
