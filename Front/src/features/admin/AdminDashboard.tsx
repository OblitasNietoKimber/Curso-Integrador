import { adminSections, adminPath } from "./adminSections";

export function AdminDashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const modules = adminSections.filter((s) => s.slug !== "" && s.slug !== "cerrar-sesion");
  return (
    <section aria-label="Módulos de administración">
      {modules.map((m) => (
        <article className="info-card" key={m.slug}>
          <h2>{m.label}</h2>
          <p>{m.description}</p>
          <button className="info-button" onClick={() => onNavigate(adminPath(m.slug))}>
            Abrir {m.label.toLowerCase()}
          </button>
        </article>
      ))}
    </section>
  );
}