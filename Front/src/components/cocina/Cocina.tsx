import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession, refreshSession } from '../../services/session';
import { cargarCocina, cambiarEstado } from '../../services/cocinaApi';
import { type Order, type Status } from '../../services/operationsStore';
import { KitchenBoard } from './KitchenBoard';
import { KitchenIncoming } from './KitchenIncoming';
import { KitchenHistory } from './KitchenHistory';
import { KitchenTimes } from './KitchenTimes';
import { CuentaCocina } from './CuentaCocina';
import { OrderDetail, Stats } from '../caja/OperationsUI';
import { Icon, type IconName } from '../caja/OperationsVisuals';
import { kitchenDay, kitchenDuration } from '../../services/kitchenHelpers';
import '../../services/referenceStyles';
import '../../styles/kitchen-board.css';
import '../../styles/kitchen-reference.css';
import '../../styles/operations-anchor-kitchen.css';
import '../../styles/cocina.css';
import '../../styles/cocina-responsive.css';

const sections: [string, string, IconName][] = [
  ['', 'Tablero de cocina', 'chef'], ['pedidos', 'Pedidos entrantes', 'receipt'],
  ['tiempos', 'Tiempos de preparación', 'clock'], ['historial', 'Historial', 'clipboard'],
];
export default function Cocina({ onNavigate, route }: { onNavigate: (path: string) => void; route: string }) {
  const session = useSession();
  if (session.loading) return <main className="ops-root" role="status">Comprobando sesión…</main>;
  if (session.error) return <main className="ops-root"><p role="alert">{session.error}</p><button onClick={() => void refreshSession()}>Reintentar</button></main>;
  if (!session.user) return <main className="ops-root"><h1>Acceso a Cocina</h1><p>Inicia sesión con una cuenta de Cocina o Administración.</p><button onClick={() => onNavigate('/iniciar-sesion?destino=cocina')}>Iniciar sesión</button></main>;
  if (!['cocina', 'administrador'].includes(session.user.role)) return <main className="ops-root"><h1>Acceso restringido</h1><p>Tu cuenta no tiene permiso de Cocina.</p><button onClick={() => onNavigate('/')}>Volver al inicio</button></main>;
  return <CocinaWorkspace key={session.user.id} onNavigate={onNavigate} section={route.split('/')[2] || ''} />;
}

function CocinaWorkspace({ onNavigate, section }: { onNavigate: (path: string) => void; section: string }) {
  const { user } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [updated, setUpdated] = useState('');
  const [today, setToday] = useState(() => kitchenDay(new Date().toISOString()));
  const lock = useRef(false);
  const mounted = useRef(false);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const version = ++generation.current;
    try {
      const result = await cargarCocina();
      if (mounted.current && version === generation.current) {
        setOrders(result); setError(''); setUpdated(new Date().toLocaleTimeString('es-PE', { timeZone: 'America/Lima' }));
        setToday(kitchenDay(new Date().toISOString()));
      }
    } catch (e) {
      if (mounted.current && version === generation.current) setError(e instanceof Error ? e.message : 'No se pudo cargar Cocina.');
    } finally { if (mounted.current) setLoading(false); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    queueMicrotask(() => { if (mounted.current) void reload(); });
    const timer = setInterval(() => { if (!lock.current) void reload(); }, 10000);
    return () => { mounted.current = false; clearInterval(timer); };
  }, [reload]);
  async function advance(id: string, status: Status) {
    if (lock.current) return;
    const order = orders.find(o => o.id === id);
    if (!order) return;
    lock.current = true; generation.current++; setBusy(true); setError('');
    try {
      const result = await cambiarEstado(id, order.status, status);
      if (mounted.current) setOrders(current => current.map(o => o.id === id ? result : o));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo actualizar el pedido.';
      await reload();
      if (mounted.current) setError(message);
    } finally { lock.current = false; if (mounted.current) setBusy(false); }
  }
  const title = sections.find(([path]) => path === section)?.[1];
  useEffect(() => { document.title = `${title || 'Cocina'} | Leñas y Sabores`; }, [title]);
  const complete = orders.filter(o => o.ready && o.accepted);
  const average = complete.length ? Math.round(complete.reduce((sum, o) => sum + kitchenDuration(o), 0) / complete.length) : 0;
  const selected = orders.find(o => o.id === detail);
  const activeOrders = orders.filter(o => !['Entregado', 'Cancelado'].includes(o.status) &&
    (!o.paid || ['Recibido', 'En preparación'].includes(o.status)));
  function navigate(path: string) { setMenu(false); onNavigate(path); }
  return <div className="ops-root ops-workspace ops-reference cocina-workspace" data-page={'cocina/' + section} aria-busy={busy || loading}>
    <aside className={'ops-sidebar' + (menu ? ' cocina-menu-open' : '')} aria-label="Menú de Cocina">
      <a className="ops-brand" href="/" onClick={e => { e.preventDefault(); navigate('/'); }}><img src="/images/logo.webp" alt="Leñas y Sabores" /></a>
      <div className="ops-area-label">Cocina</div>
      <nav className="ops-side-navigation" aria-label="Navegación Cocina">{sections.map(([path, label, icon]) => <button key={path} className={section === path ? 'active' : ''} aria-current={section === path ? 'page' : undefined} onClick={() => navigate('/cocina' + (path ? '/' + path : ''))}><Icon name={icon}/>{label}</button>)}</nav>
      {user && <CuentaCocina user={user} onNavigate={navigate}/>}
    </aside>
    <div className="ops-workspace-toolbar">
      <button className="cocina-menu-toggle" aria-label="Mostrar menú de Cocina" aria-expanded={menu} onClick={() => setMenu(!menu)}><Icon name="menu"/></button>
      <strong>Cocina</strong><span role="status">{updated ? `Actualizado: ${updated}` : 'Conectando…'}</span>
      <button disabled={busy || loading} onClick={() => void reload()}>Actualizar</button>
      {user && <CuentaCocina user={user} onNavigate={navigate} mobile/>}
    </div>
    <main id="contenido" className="ops-content">
      <div className="ops-page-heading"><div><h1>{title || 'Página no encontrada'}</h1><p>Recibe los pedidos de la Carta y envíalos listos a Caja.</p></div></div>
      <ol className="cocina-flow" aria-label="Flujo del pedido"><li><Icon name="receipt"/>Carta y carrito</li><li><Icon name="chef"/>Cocina prepara</li><li><Icon name="check"/>Listo para Caja</li><li><Icon name="card"/>Cobro</li></ol>
      {error && <div className="ops-message error" role="alert">{error} <button disabled={busy} onClick={() => void reload()}>Reintentar</button></div>}
      {loading ? <p role="status">Cargando pedidos…</p> : !title ? <button onClick={() => navigate('/cocina')}>Volver a Cocina</button> : <>
        <div className="anchor-kitchen-metrics"><Stats entries={[
          {label:'Nuevos',value:activeOrders.filter(o=>o.status==='Recibido').length,icon:'receipt'},
          {label:'En preparación',value:activeOrders.filter(o=>o.status==='En preparación').length,icon:'chef',tone:'gold'},
          {label:section==='historial'?'Preparados hoy':'Listos para Caja',value:orders.filter(o=>section==='historial'?o.ready&&kitchenDay(o.ready)===today:!o.paid&&o.status==='Listo').length,icon:'check',tone:'green'},
          {label:'Tiempo promedio',value:`${average} min`,icon:'clock',tone:'blue'},
        ]}/></div>
        <div inert={busy || undefined}>
          {section===''?<KitchenBoard orders={activeOrders} target={25} onDetail={o=>setDetail(o.id)} onStatus={(id,s)=>void advance(id,s)} navigate={navigate}/>:section==='pedidos'?<KitchenIncoming orders={activeOrders} target={25} onDetail={o=>setDetail(o.id)} onStatus={(id,s)=>void advance(id,s)}/>:section==='historial'?<KitchenHistory orders={orders} onDetail={o=>setDetail(o.id)}/>:<KitchenTimes orders={orders} target={25} onDetail={o=>setDetail(o.id)} onStatus={(id,s)=>void advance(id,s)}/>}
        </div>
      </>}
      {selected && <OrderDetail order={selected} onClose={()=>setDetail(null)}/>}
    </main>
  </div>;
}
