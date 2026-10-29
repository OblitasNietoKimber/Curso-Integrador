import { useState } from 'react';
import { cargarVentas, diaLima, sumar, agrupar } from './adminVentas';
import { dinero } from '../../services/cajaApi';
import { Panel, Stats, LineChart, Bars, Donut, ResourceState, useResource, downloadExcel } from './AdminShared';
export function AdminReportes() {
    const { data, error, loading, reload } = useResource(cargarVentas);
    const [today] = useState(() => diaLima(new Date().toISOString()));
    const [from, setFrom] = useState(today.slice(0, 7) + '-01');
    const [to, setTo] = useState(today);
    const pagos = (data?.pagos || []).filter(p => !p.reembolsado && diaLima(p.fecha) >= from && diaLima(p.fecha) <= to);
    const ids = new Set(pagos.map(p => p.pedidoId));
    const pedidos = (data?.pedidos || []).filter(p => ids.has(p.id));
    const total = sumar(pagos);
    const daily = agrupar(pagos, p => diaLima(p.fecha), p => Number(p.monto)).sort((a, b) => a.label.localeCompare(b.label));
    const channels = agrupar(pedidos, p => p.canal, () => 1);
    const methods = agrupar(pagos, p => p.metodo, p => Number(p.monto));
    const products = agrupar(pedidos.flatMap(p => p.items), i => i.producto, i => i.cantidad).sort((a, b) => b.value - a.value).slice(0, 10);
    return <><ResourceState loading={loading} error={error} retry={reload}/><div className="ops-filters"><label>Desde<input aria-label="Desde" type="date" value={from} max={to} onChange={e => setFrom(e.target.value)}/></label><label>Hasta<input aria-label="Hasta" type="date" value={to} min={from} onChange={e => setTo(e.target.value)}/></label><button onClick={() => { setFrom(today); setTo(today); }}>Hoy</button><button onClick={() => { setFrom(today.slice(0, 7) + '-01'); setTo(today); }}>Este mes</button><button onClick={() => downloadExcel('Reporte de ventas', ['Sección', 'Concepto', 'Valor'], [['Periodo', from, to], ['Resumen', 'Ventas netas (S/)', total], ['Resumen', 'Pedidos pagados', pedidos.length], ...daily.map(v => ['Ventas diarias', v.label, v.value]), ...channels.map(v => ['Canales (pedidos)', v.label, v.value]), ...methods.map(v => ['Métodos de pago (S/)', v.label, v.value]), ...products.map(v => ['Productos (unidades)', v.label, v.value])])}>Exportar Excel</button><button onClick={() => window.print()}>Imprimir</button><button onClick={() => void reload().catch(() => { })}>Actualizar</button></div><Stats entries={[{ label: 'Ventas netas', value: dinero(total) }, { label: 'Pedidos pagados', value: pedidos.length }, { label: 'Ticket promedio', value: dinero(pedidos.length ? total / pedidos.length : 0) }, { label: 'Productos vendidos', value: pedidos.flatMap(p => p.items).reduce((s, i) => s + i.cantidad, 0) }]}/><p>Se consideran cobros confirmados por fecha de pago en Perú, excluyendo reembolsos. Los pedidos pendientes no generan ventas.</p>{!pagos.length && !loading && <p role="status">No hay ventas en este periodo.</p>}<div className="admin-analysis-grid"><Panel title="Ventas diarias"><LineChart values={daily}/></Panel><Panel title="Pedidos por canal"><Donut values={channels}/></Panel><Panel title="Métodos de pago (S/)"><Donut values={methods}/></Panel><Panel title="Productos más vendidos (unidades)"><Bars values={products}/></Panel></div></>;
}
