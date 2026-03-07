import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ThemeName = "nord" | "sunset";

type ThemeContextValue = {
  theme: ThemeName;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "financeiro.theme";

function isThemeName(value: unknown): value is ThemeName {
  return value === "nord" || value === "sunset";
}

function safeReadStoredTheme(): ThemeName | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeName(raw) ? raw : null;
  } catch {
    return null;
  }
}

function safeWriteStoredTheme(theme: ThemeName) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

function safePrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function systemTheme(): ThemeName {
  return safePrefersDark() ? "sunset" : "nord";
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider(props: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("nord");
  const hasOverrideRef = useRef(false);

  useEffect(() => {
    const stored = safeReadStoredTheme();
    if (stored) {
      hasOverrideRef.current = true;
      setTheme(stored);
      return;
    }

    setTheme(systemTheme());

    if (!window.matchMedia) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      if (hasOverrideRef.current) return;
      setTheme(event.matches ? "sunset" : "nord");
    };

    try {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    } catch {
      // Safari < 14
      // eslint-disable-next-line deprecation/deprecation
      media.addListener(onChange);
      return () => {
        // eslint-disable-next-line deprecation/deprecation
        media.removeListener(onChange);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      toggleTheme: () => {
        setTheme((prev) => {
          const next: ThemeName = prev === "sunset" ? "nord" : "sunset";
          hasOverrideRef.current = true;
          safeWriteStoredTheme(next);
          return next;
        });
      },
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
