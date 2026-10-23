import { useState } from "react";
import { AdminNavigation } from "../features/admin/AdminNavigation";
import { AdminDashboard } from "../features/admin/AdminDashboard";
import { adminSections, adminPath } from "../features/admin/adminSections";
import { logout, useSession } from "../services/session";
import "../styles/account.css";
import "../styles/admin.css";


export function AdminPage({ route, onNavigate }: { route: string; onNavigate: (path: string) => void }) {
  const { user } = useSession();
  const [logoutError, setLogoutError] = useState("");
  const section = adminSections.find((s) => adminPath(s.slug) === route) || adminSections[0];

  const salir = () => {
    void logout()
      .then(() => onNavigate("/iniciar-sesion"))
      .catch((error) => setLogoutError(error.message));
  };

  if (user?.role === "cliente")
    return (
      <main id="contenido" className="base-page">
        <h1>Acceso restringido</h1>
        <p>El panel de administración es solo para el personal del negocio.</p>
        <button className="info-button" onClick={() => onNavigate("/mi-cuenta")}>Ir a mi cuenta</button>
      </main>
    );

  return (
    <main id="contenido" className="account-page">
      <div className="account-container">
        <nav className="account-breadcrumb" aria-label="Ruta actual">
          <button onClick={() => onNavigate("/")}>Inicio</button>
          <span>›</span>
          <button onClick={() => onNavigate("/admin")}>Administración</button>
          <span>›</span>
          <span aria-current="page">{section.label}</span>
        </nav>
        <div className="account-layout">
          <AdminNavigation slug={section.slug} onNavigate={onNavigate} onLogout={salir} />
          <div className="account-content">
            <header className="account-page-heading">
              <h1>{section.slug === "" ? "Panel de administración" : section.label}</h1>
              <p>{section.description}</p>
            </header>
            {logoutError && <p role="alert">{logoutError}</p>}
            {section.slug === "" ? (
              <AdminDashboard onNavigate={onNavigate} />
            ) : (
              <section className="info-card">
                <h2>{section.label}</h2>
                <p>Esta sección se construirá próximamente.</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}