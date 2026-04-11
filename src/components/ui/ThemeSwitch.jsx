import { Moon, Sun, SwatchBook } from "lucide-react";
import { useEffect, useState } from "react";

const themes = [
  { id: "porcelain", label: "Porcelain", hint: "F6/F4/00", icon: Sun },
  { id: "noir", label: "Noir", hint: "02/DD/F4", icon: Moon },
  { id: "civic-ink", label: "Royal Ink", hint: "1D/FF/FF", icon: SwatchBook },
];

export function ThemeSwitch() {
  const [theme, setTheme] = useState(() => localStorage.getItem("cittilenz_theme") || "porcelain");

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
