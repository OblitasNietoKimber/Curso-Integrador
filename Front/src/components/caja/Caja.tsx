import { useEffect, useRef, useState } from "react";
import { useSession, logout } from "../../services/session";
import { CashViews } from "./CashViews";
import { CashRegisterPanel } from "./CashRegisterPanel";
import { OperationsDialog } from "./OperationsDialog";
import { OperationsPageActions } from "../../services/operationsPageContext";
import { Icon, type IconName } from "./OperationsVisuals";
import { loadCaja, useOperations, listoParaCobrar } from "../../services/operationsStore";
import { NuevaVenta } from "./NuevaVenta";
import "../../services/referenceStyles";
const menuItems: [string, string, IconName][] = [
  ["", "Dashboard caja", "chart"],
  ["cobros", "Cobros", "card"],
  ["nueva-venta", "Nueva Venta", "plus"],
  ["comprobantes", "Comprobantes", "receipt"],
  ["turno", "Caja", "cash"],
  ["historial", "Historial", "clock"],
];
const titles: Record<string, string> = {
  "": "Dashboard de caja",
  cobros: "Cobros",
  "nueva-venta": "Nueva Venta",
  comprobantes: "Comprobantes",
  turno: "Caja",
  historial: "Historial de pagos",
};
const descriptions: Record<string, string> = {
  "": "Controla los cobros y movimientos del turno.",
  cobros: "Procesa los pagos y entrega el comprobante.",
  "nueva-venta": "Selecciona productos del catálogo y prepara la cuenta para cobrar.",
  comprobantes: "Consulta, emite e imprime tus comprobantes locales.",
  turno: "Gestiona la apertura y el cierre de tu turno en un solo lugar.",
  historial: "Consulta todas las transacciones realizadas.",
};
const sectionFor=(path:string)=>{const value=path.split("/")[2]?.split("?")[0]||"";return value==="apertura"||value==="cierre"?"turno":value};
export default function Caja({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const session = useSession();
  if (session.loading)
    return (
      <main id="contenido" className="ops-root">
        <p role="status">Comprobando sesión…</p>
      </main>
    );
  if (!session.user)
    return (
      <main id="contenido" className="ops-root">
        <h1>Acceso restringido</h1>
        <p>Inicia sesión con una cuenta de Caja o Administración.</p>
        <button onClick={() => onNavigate("/iniciar-sesion?destino=caja")}>
          Iniciar sesión
        </button>
      </main>
    );
  if (!["caja", "administrador"].includes(session.user.role.toLowerCase()))
    return (
      <main id="contenido" className="ops-root">
        <h1>Acceso restringido</h1>
        <p>Tu cuenta no tiene permiso de Caja.</p>
        <button onClick={() => onNavigate("/")}>Volver al inicio</button>
      </main>
    );
  return <CajaWorkspace key={session.user.id} onNavigate={onNavigate} />;
}
function CajaWorkspace({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useSession();
  const state = useOperations();
  const [section, setSection] = useState(
    () => sectionFor(location.pathname),
  );
  const [menu, setMenu] = useState(false),
    [profile, setProfile] = useState(false),
    [notifications, setNotifications] = useState(false);
  const [actionHost, setActionHost] = useState<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(""),
    [message, setMessage] = useState(""),
    [failed, setFailed] = useState(false),
    [busy, setBusy] = useState(false);
  const [cashMode,setCashMode]=useState<"apertura"|"cierre">("apertura");
  const lock = useRef(false);
  useEffect(() => {
    let active = true;
    loadCaja()
      .then(() => {
        if (active) setLoading(false);
      })
      .catch((e) => {
        if (active) {
          setLoadError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const pop = () => setSection(sectionFor(location.pathname));
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!lock.current) void loadCaja().catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    document.title = (titles[section] || "Caja") + " | Leñas y Sabores";
  }, [section]);
  useEffect(() => {
    if (!message || failed) return;
    const id = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(id);
  }, [message, failed]);
  function navigate(path: string) {
    setMenu(false);
    setProfile(false);
    setNotifications(false);
    setMessage("");
    if (path === "/caja" || path.startsWith("/caja/")) {
      history.pushState(null, "", path);
      setSection(sectionFor(path));
      window.scrollTo(0, 0);
    } else onNavigate(path);
  }
  function notify(task: () => void | Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    void (async () => {
      try {
        await task();
        setFailed(false);
        setMessage("Cambios guardados.");
      } catch (e) {
        const text =
          e instanceof Error ? e.message : "No se pudo guardar el cambio.";
        setFailed(true);
        setMessage(text);
        window.dispatchEvent(
          new CustomEvent("operations:error", { detail: text }),
        );
      } finally {
        lock.current = false;
        setBusy(false);
      }
    })();
  }
  const pending = state.orders.filter(listoParaCobrar);
  async function reload() {
    setLoadError("");
    setLoading(true);
    try {
      await loadCaja();
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "No se pudo cargar Caja.");
    } finally {
      setLoading(false);
    }
  }
  if (!user) return null;
  return (
    <div
      className="ops-root ops-workspace ops-reference"
      data-page={"caja/" + (section==="turno"?cashMode:section)}
      aria-busy={busy || loading}
    >
      <aside className="ops-sidebar" aria-label="Menú del panel">
        <a
          className="ops-brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <img src="/images/logo.webp" alt="Leñas y Sabores" />
        </a>
        <div className="ops-area-label">Caja</div>
        <nav
          id="ops-navigation"
          className="ops-side-navigation"
          aria-label="Navegación Caja"
        >
          {menuItems.map(([path, label, icon]) => (
            <button
              className={section === path ? "active" : ""}
              aria-current={section === path ? "page" : undefined}
              key={path}
              onClick={() => navigate("/caja" + (path ? "/" + path : ""))}
            >
              <Icon name={icon} />
              {label}
            </button>
          ))}
        </nav>
        <button
          className="ops-side-account"
          onClick={() => setProfile(true)}
          aria-label="Abrir perfil de cuenta"
        >
          <span className="ops-side-avatar" aria-hidden="true">
            {user.role === "administrador" ? "A" : "C"}
          </span>
          <span className="ops-side-account-info">
            <strong>
              {user.role === "administrador" ? "Administrador" : "Caja"}
            </strong>
            <small>{state.settings.name}</small>
          </span>
          <Icon name="chevron" className="ops-side-account-chevron" />
        </button>
      </aside>
      <div className="ops-workspace-toolbar">
        <button
          className="ops-menu"
          aria-label="Abrir menú del panel"
          aria-expanded={menu}
          onClick={() => setMenu(true)}
        >
          <Icon name="menu" />
        </button>
        <a
          className="ops-mobile-brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <img src="/images/logo.webp" alt="Leñas y Sabores" />
        </a>
        <span className="ops-workspace-status">
          <span
            aria-hidden="true"
            className={state.settings.open ? "is-open" : ""}
          />
          {state.settings.open ? "Local abierto" : "Local cerrado"}
        </span>
        <button
          aria-label="Notificaciones de pedidos"
          onClick={() => setNotifications(true)}
        >
          <Icon name="bell" />
          {pending.length}
        </button>
        <button
          className="ops-mobile-account"
          aria-label={"Cuenta de " + user.name}
          onClick={() => setProfile(true)}
        >
          <Icon name="user" />
        </button>
      </div>
      {menu && (
        <OperationsDialog
          title="Caja"
          onClose={() => setMenu(false)}
          className="ops-navigation-dialog"
        >
          <nav
            id="ops-mobile-navigation"
            className="ops-side-navigation"
            aria-label="Navegación Caja"
          >
            {menuItems.map(([path, label, icon]) => (
              <button
                key={path}
                className={section === path ? "active" : ""}
                onClick={() => navigate("/caja" + (path ? "/" + path : ""))}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </nav>
        </OperationsDialog>
      )}
      {profile && (
        <OperationsDialog
          title="Mi cuenta"
          onClose={() => setProfile(false)}
          className="ops-profile-modal"
        >
          <div className="ops-profile-card">
            <div className="ops-profile-header">
              <div className="ops-profile-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ops-profile-user">
                <strong className="ops-profile-name">{user.name}</strong>
                <span className="ops-profile-role-badge">
                  {user.role === "administrador" ? "Administrador" : "Caja"}
                </span>
                <span className="ops-profile-brand">{state.settings.name}</span>
              </div>
            </div>
            <div className="ops-profile-actions-list">

              <button
                className="ops-profile-item"
                onClick={() => {
                  setProfile(false);
                  setNotifications(true);
                }}
              >
                <span className="ops-profile-icon ops-icon-blue">
                  <Icon name="clipboard-list" />
                </span>
                <div className="ops-profile-item-text">
                  <strong>Pedidos activos</strong>
                  <small>Revisa los pedidos por cobrar</small>
                </div>
                <span className="ops-profile-count-pill">{pending.length}</span>
                <Icon name="chevron-right" />
              </button>
              <button
                className="ops-profile-item"
                onClick={() => navigate("/")}
              >
                <span className="ops-profile-icon ops-icon-dark">
                  <Icon name="world" />
                </span>
                <div className="ops-profile-item-text">
                  <strong>Ver sitio público</strong>
                  <small>Abre la página de tu restaurante</small>
                </div>
                <Icon name="external-link" />
              </button>
            </div>
            <button
              className="ops-profile-logout-btn"
              disabled={busy}
              onClick={() =>
                notify(async () => {
                  await logout();
                  onNavigate("/iniciar-sesion");
                })
              }
            >
              <span className="ops-profile-logout-icon">
                <Icon name="logout" />
              </span>
              <span className="ops-profile-logout-text">Cerrar sesión</span>
              <Icon name="chevron-right" />
            </button>
          </div>
        </OperationsDialog>
      )}
      {notifications && (
        <OperationsDialog
          title="Pedidos activos"
          onClose={() => setNotifications(false)}
        >
          {pending.map((o) => (
            <div className="ops-notification-item" key={o.id}>
              <strong>#{o.id}</strong>
              <span>{o.customer}</span>
              <span>Pendiente de cobro</span>
            </div>
          ))}
          {!pending.length && <p>No hay pedidos pendientes.</p>}
        </OperationsDialog>
      )}
      <OperationsPageActions.Provider value={actionHost}>
        <main id="contenido" className="ops-content">
          <div className="ops-page-heading">
            <div>
              <h1>{titles[section] || "Página no encontrada"}</h1>
              <p>{descriptions[section]}</p>
            </div>
            <div id="ops-page-actions" ref={setActionHost} />
          </div>
          {message && (
            <div
              className={"ops-message ops-toast " + (failed ? "error" : "")}
              role={failed ? "alert" : "status"}
            >
              {message}
              <button
                aria-label="Cerrar mensaje"
                onClick={() => setMessage("")}
              >
                ×
              </button>
            </div>
          )}
          {loading ? (
            <p role="status">Cargando Caja desde el servidor…</p>
          ) : loadError ? (
            <div className="ops-message error" role="alert">
              <p>{loadError}</p>
              <button onClick={() => void reload()}>Reintentar</button>
            </div>
          ) : titles[section] ? (
            <>
              <div inert={busy || undefined}>
                {section==="nueva-venta"?<NuevaVenta busy={busy} notify={notify} onComplete={()=>{navigate("/caja/cobros");setMessage("Pedido enviado a Cocina. Aparecerá para cobrar cuando esté listo.");}}/>:section==="turno"?<CashRegisterPanel notify={notify} navigate={navigate} onModeChange={setCashMode}/>:<CashViews
                  key={section}
                  section={section}
                  notify={notify}
                  navigate={navigate}
                />}
              </div>
            </>
          ) : (
            <button onClick={() => navigate("/caja")}>Volver a Caja</button>
          )}
        </main>
      </OperationsPageActions.Provider>

    </div>
  );
}
