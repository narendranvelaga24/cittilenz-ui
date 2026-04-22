import { useEffect, useState } from "react";

function getStoredTheme() {
  const stored = localStorage.getItem("cittilenz_theme");
  if (stored === "porcelain") return "light";
  if (stored === "noir" || stored === "civic-ink") return "dark";
  return stored || "light";
}

export function useThemeMode() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return getStoredTheme();
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("cittilenz_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return { setTheme, theme, toggleTheme };
}
