import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";

export function renderWithDataRouter(ui: ReactElement) {
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: ui,
      },
    ],
    {
      initialEntries: ["/"],
    },
  );

  return render(<RouterProvider router={router} />);
}