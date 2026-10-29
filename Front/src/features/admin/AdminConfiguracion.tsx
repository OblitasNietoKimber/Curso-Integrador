import { useState } from 'react';
import { apiRequest } from '../../services/api';
import { Panel, ResourceState, useResource, messageOf } from './AdminShared';
type Config = {
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    ruc: string;
    horario: string;
};
const cargar = () => apiRequest<Config>('/admin/configuracion');
export function AdminConfiguracion() {
    const { data, error, loading, reload } = useResource(cargar);
    const [draft, setDraft] = useState<Config>();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [failure, setFailure] = useState('');
    const form = draft || data;
    async function save() { if (!form)
        return; setBusy(true); setFailure(''); setMessage(''); try {
        await apiRequest('/admin/configuracion', { method: 'PUT', body: JSON.stringify(form) });
        await reload();
        setDraft(undefined);
        setMessage('Configuración guardada. Se aplicará a los datos del negocio en Caja.');
    }
    catch (e) {
        setFailure(messageOf(e));
    }
    finally {
        setBusy(false);
    } }
    return <><ResourceState loading={loading} error={error} retry={reload}/><Panel title="Datos del negocio">{form && <form className="admin-form" onSubmit={e => { e.preventDefault(); void save(); }}>{([['nombre', 'Nombre del negocio', 120], ['direccion', 'Dirección', 255], ['telefono', 'Teléfono', 25], ['email', 'Correo', 254], ['ruc', 'RUC', 11], ['horario', 'Horario de atención', 100]] as const).map(([key, label, max]) => <label key={key}>{label}<input required={key !== 'ruc'} maxLength={max} type={key === 'email' ? 'email' : 'text'} value={form[key]} onChange={e => setDraft({ ...form, [key]: e.target.value })}/></label>)}{failure && <p role="alert">{failure}</p>}{message && <p role="status">{message}</p>}<button className="ops-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar configuración'}</button></form>}</Panel></>;
}
