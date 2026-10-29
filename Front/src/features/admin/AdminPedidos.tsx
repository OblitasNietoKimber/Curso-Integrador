import { useState } from 'react';
import { cargarVentas } from './adminVentas';
import { dinero, fecha, type Pedido } from '../../services/cajaApi';
import { Panel, Table, Dialog, ResourceState, Pagination, useResource, downloadExcel, normalize } from './AdminShared';
export function AdminPedidos() {
    const { data, error, loading, reload } = useResource(cargarVentas);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('Todos');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Pedido>();
    const rows = (data?.pedidos || []).filter(p => normalize(p.id + ' ' + p.cliente + ' ' + p.canal).includes(normalize(search)) && (status === 'Todos' || (p.pagado ? 'Pagado' : 'Pendiente') === status)).sort((a, b) => (b.creado || '').localeCompare(a.creado || ''));
    return <><ResourceState loading={loading} error={error} retry={reload}/><div className="ops-filters"><input aria-label="Buscar pedidos" placeholder="Buscar pedido o cliente" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/><select aria-label="Estado" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>{['Todos', 'Pagado', 'Pendiente'].map(s => <option key={s}>{s}</option>)}</select><button onClick={() => void reload().catch(() => { })}>Actualizar</button><button onClick={() => downloadExcel('Pedidos', ['Pedido', 'Cliente', 'Canal', 'Total', 'Pagado'], rows.map(p => [p.id, p.cliente, p.canal, p.total, p.pagado]))}>Exportar Excel</button></div><Panel title="Pedidos recientes"><div className="ops-table-wrap"><Table><thead><tr><th>Pedido</th><th>Cliente</th><th>Canal</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{rows.slice((page - 1) * 10, page * 10).map(p => <tr key={p.id}><td>#{p.id}</td><td>{p.cliente}</td><td>{p.canal}</td><td>{p.creado ? fecha(p.creado) : '—'}</td><td>{dinero(p.total)}</td><td>{p.pagado ? 'Pagado' : 'Pendiente'}</td><td><button onClick={() => setSelected(p)}>Ver detalle</button></td></tr>)}{!rows.length && !loading && <tr><td colSpan={7}>No hay pedidos.</td></tr>}</tbody></Table></div><Pagination count={rows.length} page={page} onPage={setPage}/></Panel>{selected && <Dialog title={'Pedido #' + selected.id} onClose={() => setSelected(undefined)}><p>{selected.cliente} · {selected.canal} · {selected.pagado ? 'Pagado' : 'Pendiente de pago'}</p>{selected.items.map((i, n) => <p key={n}>{i.cantidad} × {i.producto}: {dinero(i.precio * i.cantidad)}</p>)}<strong>Total: {dinero(selected.total)}</strong></Dialog>}</>;
}
