// Intentionally does NOT mock react-router (unlike app/test/vitest.ui.setup.ts),
// because domain UI components that use useLocation/useNavigate must be tested
// inside a real createMemoryRouter context.
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
