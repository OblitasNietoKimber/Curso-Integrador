import type { ReactNode } from 'react';
import { AdminImageField } from './AdminImageField';
import { useState } from 'react';
import { Dialog, Panel, Table, ResourceState, Pagination, useResource, messageOf, normalize, downloadExcel } from './AdminShared';
import { apiRequest } from '../../services/api';
export type RecordData = {
    id: string;
    [key: string]: string | number | boolean | null;
};
export type Field = {
    key: string;
    label: string;
    type?: string;
    options?: string[];
    required?: boolean;
    max?: number;
    readOnly?: boolean;
};
export function AdminEditor({ title, path, fields, defaults, canCreate = true, readOnlyKeys = [], extraActions }: {
    title: string;
    path: string;
    fields: Field[];
    defaults: RecordData;
    canCreate?: boolean;
    readOnlyKeys?: string[];
    extraActions?: (row:RecordData)=>ReactNode;
}) {
    const loader = useState(() => () => apiRequest<RecordData[]>(path))[0];
    const { data = [], error, loading, reload } = useResource(loader);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [form, setForm] = useState<RecordData>();
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState('');
    const [notice, setNotice] = useState('');
    const rows = data.filter(r => fields.some(f => normalize(String(r[f.key] ?? '')).includes(normalize(search))));
    const visibleFields = fields.filter(f => f.type !== 'password');
    const save = async () => { if (!form)
        return; setBusy(true); setFailure(''); try {
        await apiRequest(path + (form.id ? '/' + encodeURIComponent(form.id) : ''), { method: form.id ? 'PUT' : 'POST', body: JSON.stringify(form) });
        setForm(undefined);
        await reload();
        setNotice('Cambios guardados correctamente.');
    }
    catch (e) {
        setFailure(messageOf(e));
    }
    finally {
        setBusy(false);
    } };
    return <><ResourceState loading={loading} error={error} retry={reload}/><div className="ops-filters"><input aria-label={'Buscar ' + title} placeholder={'Buscar ' + title.toLowerCase()} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/><button onClick={() => downloadExcel(title, visibleFields.map(f => f.label), rows.map(r => visibleFields.map(f => String(r[f.key] ?? ''))))}>Exportar Excel</button>{canCreate && <button className="ops-primary" onClick={() => { setForm({ ...defaults }); setFailure(''); }}>Nuevo registro</button>}</div>{notice && <p role="status">{notice}</p>}<Panel title={title}><div className="ops-table-wrap"><Table><thead><tr>{visibleFields.map(f => <th key={f.key}>{f.label}</th>)}<th>Acciones</th></tr></thead><tbody>{rows.slice((page - 1) * 10, page * 10).map(r => <tr key={r.id}>{visibleFields.map(f => <td key={f.key}>{f.type === 'checkbox' ? (r[f.key] ? 'Activo' : 'Inactivo') : f.type === 'image' ? <img className="admin-thumbnail" src={String(r[f.key] || '/images/logo.webp')} alt=""/> : String(r[f.key] ?? '—')}</td>)}<td><button disabled={r.rol === 'CLIENTE'} onClick={() => { setForm({ ...r, password: '' }); setFailure(''); }}>Editar</button>{extraActions?.(r)}</td></tr>)}{!rows.length && !loading && <tr><td colSpan={visibleFields.length + 1}>No hay registros que coincidan.</td></tr>}</tbody></Table></div><Pagination count={rows.length} page={page} onPage={setPage}/></Panel>{form && <Dialog title={form.id ? 'Editar ' + title.toLowerCase() : 'Nuevo registro'} onClose={() => { if (!busy)
        setForm(undefined); }}><form className="admin-form" onSubmit={e => { e.preventDefault(); void save(); }}>{fields.filter(f => !(form.id && f.type === 'password')).map(f => <label key={f.key}>{f.label}{f.type === 'image' ? <AdminImageField value={String(form[f.key] ?? '')} onBusy={setBusy} onChange={url => setForm(current => current ? { ...current, [f.key]: url } : current)}/> : f.type === 'checkbox' ? <input type="checkbox" checked={Boolean(form[f.key])} onChange={e => setForm({ ...form, [f.key]: e.target.checked })}/> : f.options ? <select value={String(form[f.key] ?? '')} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>{f.options.map(o => <option key={o}>{o}</option>)}</select> : <input required={f.required} maxLength={f.max ?? 255} readOnly={f.readOnly || Boolean(form.id) && readOnlyKeys.includes(f.key)} type={f.type === 'image' ? 'text' : f.type || 'text'} step={f.type === 'number' ? '0.01' : undefined} min={f.type === 'number' ? '0' : undefined} minLength={f.type === 'password' ? 8 : undefined} value={String(form[f.key] ?? '')} onChange={e => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}/>}</label>)}{failure && <p role="alert">{failure}</p>}<footer className="ops-dialog-footer"><button type="button" disabled={busy} onClick={() => setForm(undefined)}>Cancelar</button><button className="ops-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button></footer></form></Dialog>}</>;
}
