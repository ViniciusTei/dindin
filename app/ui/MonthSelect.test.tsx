import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import MonthSelect from "./MonthSelect";

function renderMonthSelect(props: Parameters<typeof MonthSelect>[0]) {
  const router = createMemoryRouter(
    [{ path: "*", element: <MonthSelect {...props} /> }],
    { initialEntries: ["/"] },
  );
  return render(<RouterProvider router={router} />);
}

describe("MonthSelect", () => {
  it("renders prev/next links", () => {
    renderMonthSelect({
      monthLabel: "março 2026",
      previousLink: "/?month=2026-02",
      nextLink: "/?month=2026-04",
    });
    expect(screen.getByLabelText("Mês anterior")).toBeInTheDocument();
    expect(screen.getByLabelText("Próximo mês")).toBeInTheDocument();
  });

  it("renders dropdown when availableMonths provided", () => {
    renderMonthSelect({
      monthLabel: "março 2026",
      previousLink: "/?month=2026-02",
      nextLink: "/?month=2026-04",
      availableMonths: [
        { label: "fevereiro 2026", link: "/?month=2026-02" },
        { label: "março 2026", link: "/?month=2026-03" },
      ],
    });
    expect(screen.getByRole("button", { name: /março 2026/i })).toBeInTheDocument();
  });
});
