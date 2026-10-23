import { useSession } from "../../services/session";
import { Icon } from "../../components/Icon";
import { displayFirstName } from "../../services/displayName";
import { adminSections, adminPath } from "./adminSections";

export function AdminNavigation({
  slug,
  onNavigate,
  onLogout,
}: {
  slug: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}) {
  const { user } = useSession();
  const selected = adminSections.find((s) => s.slug === slug) || adminSections[0];
  const navigate = (value: string) =>
    value === "cerrar-sesion" ? onLogout() : onNavigate(adminPath(value));
  return (
    <>
      <aside className="account-sidebar info-card">
        <div className="account-identity">
          <span className="account-avatar">
            <Icon name="user" />
          </span>
          <div>
            <strong>{displayFirstName(user?.name || "")}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
        <nav aria-label="Secciones del panel de administración">
          {adminSections.map((s) => (
            <button
              type="button"
              key={s.slug}
              className={s.slug === "cerrar-sesion" ? "account-exit" : ""}
              aria-current={s.slug === slug ? "page" : undefined}
              onClick={() => navigate(s.slug)}
            >
              <Icon name={s.icon} />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <label className="account-mobile-select">
        <Icon name={selected.icon} />
        <span className="sr-only">Sección del panel</span>
        <select
          aria-label="Sección del panel"
          value={slug}
          onChange={(e) => navigate(e.target.value)}
        >
          {adminSections.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>
        <Icon name="chevron" />
      </label>
    </>
  );
}