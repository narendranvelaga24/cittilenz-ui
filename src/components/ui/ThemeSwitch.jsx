import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const themes = [
  { id: "light", label: "Light", hint: "F6/F4/00", icon: Sun },
  { id: "dark", label: "Dark", hint: "02/DD/F4", icon: Moon },
];

export function ThemeSwitch() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("cittilenz_theme");
    if (stored === "porcelain") return "light";
    if (stored === "noir" || stored === "civic-ink") return "dark";
    return stored || "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("cittilenz_theme", theme);
  }, [theme]);

  return (
    <div className="theme-switch" aria-label="Theme selector">
      {themes.map((item) => {
        const Icon = item.icon;
        return (
          <button
            aria-label={`Use ${item.label} theme`}
            aria-pressed={theme === item.id}
            className={theme === item.id ? "active" : ""}
            key={item.id}
            onClick={() => setTheme(item.id)}
            type="button"
            title={`${item.label} palette (${item.hint})`}
          >
            <Icon size={14} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
