import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "./useThemeMode.js";

const themes = [
  { id: "light", label: "Light", hint: "F6/F4/00", icon: Sun },
  { id: "dark", label: "Dark", hint: "02/DD/F4", icon: Moon },
];

export function ThemeSwitch() {
  const { setTheme, theme } = useThemeMode();

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
