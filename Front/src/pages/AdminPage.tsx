import { AdminPromociones } from '../features/admin/AdminPromociones';
import { AdminClientes } from '../features/admin/AdminClientes';
import { AdminUsuarios } from '../features/admin/AdminUsuarios';
import { AdminPedidos } from '../features/admin/AdminPedidos';
import { AdminReportes } from '../features/admin/AdminReportes';
import { AdminConfiguracion } from '../features/admin/AdminConfiguracion';
import { useEffect, useState } from 'react';
import { AdminNavigation } from '../features/admin/AdminNavigation';
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { AdminProductos } from '../features/admin/AdminProductos';
import { adminSections, adminPath } from '../features/admin/adminSections';
import { Icon, Dialog, messageOf } from '../features/admin/AdminShared';
import { logout, useSession } from '../services/session';
import '../services/referenceStyles';
import '../styles/admin-operations-products.css';
import '../styles/admin-operations-admin-panels.css';
import '../styles/admin-operations-dashboard.css';
import '../styles/admin-prototype-operations.css';
import '../styles/admin.css';
import '../styles/admin-management.css';
export function AdminPage({ route, onNavigate }: {
    route: string;
    onNavigate: (path: string) => void;
}) {
    const { user } = useSession();
    const [currentDate] = useState(() => new Date());
    const [menu, setMenu] = useState(false);
    const [error, setError] = useState('');
    const [leaving, setLeaving] = useState(false);
    const section = adminSections.find(s => adminPath(s.slug) === route);
    const navigate = (p: string) => { setMenu(false); onNavigate(p); };
    useEffect(() => { document.title = (section?.label || 'Administración') + ' | Leñas y Sabores'; }, [section]);
    if (user?.role !== 'administrador')
        return <main id="contenido" className="base-page"><h1>Acceso restringido</h1><p>Este panel requiere una cuenta de administrador.</p><button onClick={() => navigate('/')}>Ir al inicio</button></main>;
    return <div className="ops-root ops-workspace ops-reference admin-workspace" data-page={'administrador/' + (section?.slug || '')}><AdminNavigation slug={section?.slug || ''} onNavigate={navigate} onLogout={() => setLeaving(true)}/><div className="ops-workspace-toolbar"><button aria-label="Abrir menú del panel" className="ops-menu" onClick={() => setMenu(true)}><Icon name="menu"/></button><img src="/images/logo.webp" alt="Leñas y Sabores"/><span>Administración</span></div><main id="contenido" className="ops-main"><header className="ops-page-header"><div><h1>{section?.slug === '' ? 'Dashboard general' : section?.label === 'Reportes' ? 'Reportes y analítica' : section?.label || 'Página no encontrada'}</h1><p>{section?.description}</p></div><time>{currentDate.toLocaleDateString('es-PE', { timeZone: 'America/Lima', day: 'numeric', month: 'long', year: 'numeric' })}</time></header>{section?.slug === '' ? <AdminDashboard onNavigate={navigate}/> : section?.slug === 'productos' ? <AdminProductos /> : section?.slug === 'promociones' ? <AdminPromociones /> : section?.slug === 'clientes' ? <AdminClientes /> : section?.slug === 'usuarios' ? <AdminUsuarios /> : section?.slug === 'pedidos' ? <AdminPedidos /> : section?.slug === 'reportes' ? <AdminReportes /> : section?.slug === 'configuracion' ? <AdminConfiguracion /> : <p>Selecciona una sección del panel.</p>}</main>{menu && <Dialog title="Administración" onClose={() => setMenu(false)}><nav className="ops-side-navigation">{adminSections.map(s => <button key={s.slug} onClick={() => navigate(adminPath(s.slug))}><Icon name={s.icon}/>{s.label}</button>)}<button onClick={() => { setMenu(false); setLeaving(true); }}>Cerrar sesión</button></nav></Dialog>}{leaving && <Dialog title="Cerrar sesión" onClose={() => setLeaving(false)}><p>¿Deseas cerrar tu sesión?</p>{error && <p role="alert">{error}</p>}<footer className="ops-dialog-footer"><button onClick={() => setLeaving(false)}>Cancelar</button><button className="ops-primary" onClick={() => { void logout().then(() => navigate('/iniciar-sesion')).catch(e => setError(messageOf(e))); }}>Cerrar sesión</button></footer></Dialog>}</div>;
}
