"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

type Theme = "dark" | "light";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

function systemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Paint the phone browser bar (meta theme-color) to match the active theme —
 * the admin uses its own background. The media-specific tags from the layout
 * only follow the OS setting, so they're collapsed to one explicit colour.
 */
function syncThemeColor(theme: Theme, pathname: string) {
  const admin = pathname.startsWith("/admin");
  const color = admin
    ? theme === "dark" ? "#06070d" : "#f3f5f9"
    : theme === "dark" ? "#09090b" : "#f5f5f4";
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  if (!metas.length) {
    const m = document.createElement("meta");
    m.name = "theme-color";
    document.head.appendChild(m);
    m.content = color;
    return;
  }
  metas.forEach((m) => {
    m.removeAttribute("media");
    m.content = color;
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start from whatever the pre-paint inline script already applied to <html>.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored ?? systemTheme();
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");

    // If the user hasn't chosen manually, follow OS changes live.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("theme")) return; // manual choice wins
      const next: Theme = e.matches ? "dark" : "light";
      setTheme(next);
      document.documentElement.classList.toggle("dark", next === "dark");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const pathname = usePathname() || "/";
  useEffect(() => {
    syncThemeColor(theme, pathname);
  }, [theme, pathname]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
