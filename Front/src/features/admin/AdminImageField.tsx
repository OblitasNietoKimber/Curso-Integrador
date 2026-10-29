import { useState } from 'react';
import { apiRequest } from '../../services/api';
import { messageOf } from './AdminShared';
export function AdminImageField({ value, onChange, onBusy }: {
    value: string;
    onChange: (url: string) => void;
    onBusy?: (busy: boolean) => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    return <div className="admin-image-field"><input aria-label="Ruta o URL de imagen" maxLength={255} value={value} onChange={e => onChange(e.target.value)}/><input aria-label="Subir imagen PNG o JPG" type="file" accept="image/png,image/jpeg" disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (!file)
        return; if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe pesar hasta 5 MB.');
        return;
    } setBusy(true); onBusy?.(true); setError(''); const form = new FormData(); form.append('archivo', file); void apiRequest<{
        url: string;
    }>('/admin/imagenes', { method: 'POST', body: form }).then(r => onChange(r.url)).catch(e => setError(messageOf(e))).finally(() => { setBusy(false); onBusy?.(false); }); }}/>{busy && <span role="status">Subiendo imagen…</span>}{error && <p role="alert">{error}</p>}{value && <img className="admin-thumbnail" src={value} alt="Vista previa"/>}</div>;
}
