import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");

  return {
    ...actual,
    Link: ({ to, children, ...rest }: any) =>
      React.createElement(
        "a",
        { href: typeof to === "string" ? to : "#", ...rest },
        children
      ),
    Form: ({ children, ...rest }: any) =>
      React.createElement("form", { ...rest }, children),
  };
});
