import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import Logo from "./Logo";
import { SECTIONS } from "../../lib/sections";
import { listSessions, deleteSession, storageAvailable } from "../../lib/storage";

function relativeTime(timestamp) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Sidebar({
  open,
  onCloseMobile,
  hasSession,
  activeSection,
  onSelectSection,
  activeSessionId,
  onSelectSession,
  onNewStudy,
  refreshKey,
}) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    setSessions(storageAvailable ? listSessions() : []);
  }, [refreshKey, open]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions(listSessions());
  };

  const handleSelectSession = (session) => {
    onSelectSession(session);
    onCloseMobile?.();
  };

  return (
    <>
      {open && <div className="sidebar-scrim" onClick={onCloseMobile} />}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`} aria-label="Recall navigation">
        <div className="sidebar__top">
          <Logo />
          <button className="icon-btn sidebar__close" onClick={onCloseMobile} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <button className="btn btn--primary sidebar__new" onClick={onNewStudy}>
          <Plus size={16} strokeWidth={2.5} />
          New study
        </button>

        {hasSession && (
          <nav className="sidebar__nav" aria-label="Study sections">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  className={`sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}`}
                  onClick={() => {
                    onSelectSection(section.id);
                    onCloseMobile?.();
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={17} strokeWidth={2} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        <div className="sidebar__divider" />

        <div className="sidebar__sessions">
          <h2 className="sidebar__heading">Recent</h2>
          {!storageAvailable ? (
            <p className="sidebar__empty">Local storage isn&apos;t available, so sessions can&apos;t be saved.</p>
          ) : sessions.length === 0 ? (
            <p className="sidebar__empty">Your study sets will show up here.</p>
          ) : (
            <ul className="sidebar__session-list">
              {sessions.map((s) => (
                <li key={s.id}>
                  <div className={`session-row ${s.id === activeSessionId ? "session-row--active" : ""}`}>
                    <button className="session-row__select" onClick={() => handleSelectSession(s)}>
                      <span className="session-row__title">{s.topic}</span>
                      <span className="session-row__time">{relativeTime(s.updatedAt)}</span>
                    </button>
                    <button
                      type="button"
                      className="session-row__delete"
                      aria-label={`Delete ${s.topic}`}
                      onClick={(e) => handleDelete(e, s.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
