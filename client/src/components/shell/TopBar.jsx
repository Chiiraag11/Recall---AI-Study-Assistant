import { Menu, Sun, Moon, Check } from "lucide-react";

export default function TopBar({
  onOpenMobileSidebar,
  title,
  subtitle,
  saved,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="icon-btn topbar__menu" onClick={onOpenMobileSidebar} aria-label="Open menu">
          <Menu size={19} />
        </button>
        <div className="topbar__titles">
          <span className="topbar__title">{title}</span>
          {subtitle && <span className="topbar__subtitle">{subtitle}</span>}
        </div>
      </div>

      <div className="topbar__right">
        {saved && (
          <span className="topbar__saved">
            <Check size={13} strokeWidth={2.5} />
            Saved
          </span>
        )}
        <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
