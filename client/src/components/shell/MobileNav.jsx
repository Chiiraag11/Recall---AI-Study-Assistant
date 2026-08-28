import { LayoutGrid, Layers, ListChecks, MoreHorizontal } from "lucide-react";

const PRIMARY = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "flashcards", label: "Cards", icon: Layers },
  { id: "quiz", label: "Quiz", icon: ListChecks },
];

export default function MobileNav({ activeSection, onSelectSection, onMore, moreActive }) {
  return (
    <nav className="mobile-nav" aria-label="Study sections">
      {PRIMARY.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === activeSection;
        return (
          <button
            key={item.id}
            className={`mobile-nav__item ${isActive ? "mobile-nav__item--active" : ""}`}
            onClick={() => onSelectSection(item.id)}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
      <button
        className={`mobile-nav__item ${moreActive ? "mobile-nav__item--active" : ""}`}
        onClick={onMore}
      >
        <MoreHorizontal size={20} strokeWidth={moreActive ? 2.4 : 2} />
        <span>More</span>
      </button>
    </nav>
  );
}
