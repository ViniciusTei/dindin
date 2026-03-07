import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider, useTheme } from "./ThemeContext";

type MockMqlController = {
  mql: MediaQueryList;
  setMatches: (next: boolean) => void;
  dispatchChange: () => void;
};

function mockMatchMedia(initialMatches: boolean): MockMqlController {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  const mql = {
    matches: initialMatches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
      if (type !== "change") return;
      listeners.add(listener as unknown as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
      if (type !== "change") return;
      listeners.delete(listener as unknown as (event: MediaQueryListEvent) => void);
    },
    // Safari legacy
    addListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: () => true,
  } as unknown as MediaQueryList;

  (window as any).matchMedia = vi.fn().mockReturnValue(mql);

  return {
    mql,
    setMatches: (next) => {
      (mql as any).matches = next;
    },
    dispatchChange: () => {
      const event = { matches: (mql as any).matches, media: (mql as any).media } as MediaQueryListEvent;
      for (const listener of listeners) listener(event);
    },
  };
}

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("usa override do localStorage quando existir", async () => {
    window.localStorage.setItem("financeiro.theme", "sunset");
    const mql = mockMatchMedia(false);

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("sunset");
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("sunset");

    // Mudança do sistema não deve afetar se há override
    mql.setMatches(true);
    mql.dispatchChange();

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("sunset");
    });
  });

  it("sem override, inicializa via prefers-color-scheme", async () => {
    mockMatchMedia(true);

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("sunset");
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("sunset");
  });

  it("toggleTheme alterna tema, atualiza data-theme e persiste override", async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("nord");
    });

    await user.click(screen.getByRole("button", { name: "toggle" }));

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("sunset");
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("sunset");
    expect(window.localStorage.getItem("financeiro.theme")).toBe("sunset");
  });

  it("sem override, reage ao evento de change do matchMedia", async () => {
    const mql = mockMatchMedia(false);

    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("nord");
    });

    mql.setMatches(true);
    mql.dispatchChange();

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("sunset");
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("sunset");
    expect(window.localStorage.getItem("financeiro.theme")).toBeNull();
  });
});
