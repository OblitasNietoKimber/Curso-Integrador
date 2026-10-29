import { useState } from 'react';
import { cargarVentas, diaLima, sumar, agrupar } from './adminVentas';
import { dinero } from '../../services/cajaApi';
import { Panel, Stats, LineChart, Bars, ResourceState, useResource } from './AdminShared';
export function AdminDashboard({ onNavigate }: {
    onNavigate: (path: string) => void;
}) {
    const { data, error, loading, reload } = useResource(cargarVentas);
    const [today] = useState(() => diaLima(new Date().toISOString()));
    const pagos = (data?.pagos || []).filter(p => !p.reembolsado && diaLima(p.fecha) === today);
    const pendientes = (data?.pedidos || []).filter(p => !p.pagado);
    const total = sumar(pagos);
    const ids = new Set(pagos.map(p => p.pedidoId));
    const vendidos = (data?.pedidos || []).filter(p => ids.has(p.id));
    const recent = [...(data?.pedidos || [])].sort((a, b) => (b.creado || '').localeCompare(a.creado || '')).slice(0, 5);
    const hourly = new Map(agrupar(pagos, p => new Date(p.fecha).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', hour12: false }) + ':00', p => Number(p.monto)).map(v => [v.label, v.value]));
    const trend = Array.from({length:24},(_,hour)=>{const label=String(hour).padStart(2,'0')+':00';return {label,value:hourly.get(label)||0};});
    return <><ResourceState loading={loading} error={error} retry={reload}/><Stats entries={[{ label: 'Ventas de hoy', value: dinero(total) }, { label: 'Pedidos pagados hoy', value: ids.size }, { label: 'Pendientes de pago', value: pendientes.length }, { label: 'Ticket promedio', value: dinero(ids.size ? total / ids.size : 0) }]}/><div className="admin-analysis-grid"><Panel title="Ventas de hoy" action={<button onClick={() => onNavigate('/admin/reportes')}>Ver reportes</button>}><LineChart values={trend}/></Panel><Panel title="Productos más vendidos"><Bars values={agrupar(vendidos.flatMap(p => p.items), i => i.producto, i => i.cantidad).sort((a, b) => b.value - a.value).slice(0, 5)}/></Panel></div><Panel title="Pedidos recientes" action={<button onClick={() => onNavigate('/admin/pedidos')}>Ver todos</button>}>{recent.map(p => <div className="admin-recent" key={p.id}><span>#{p.id} · {p.cliente}</span><span>{p.canal}</span><strong>{dinero(p.total)}</strong><span>{p.pagado ? 'Pagado' : 'Pendiente'}</span></div>)}{!recent.length && !loading && <p>Aún no hay pedidos registrados.</p>}</Panel></>;
}
