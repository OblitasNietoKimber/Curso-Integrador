import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { apiRequest } from '../../services/api';
import { changePassword } from '../../services/authService';
import { AccountDialog } from './AccountShared';

type Security = { enabled: boolean; available: boolean; hasPassword: boolean };
export function AccountSecurity() {
  const [security, setSecurity] = useState<Security | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<'password' | 'enable' | 'disable' | ''>('');
  const [setup, setSetup] = useState<{secret: string; qr: string} | null>(null);
  const [code, setCode] = useState('');
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');
  const [recovery, setRecovery] = useState<string[]>([]);
  useEffect(() => { let active = true; apiRequest<Security>('/account/security').then(value => { if (active) setSecurity(value); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, []);
  function close() { if (busy) return; setDialog(''); setSetup(null); setCode(''); setPrevious(''); setNext(''); setError(''); }
  async function run(action: () => Promise<void>) { setBusy(true); setError(''); setMessage(''); try { await action(); } catch(e) { setError(e instanceof Error ? e.message : 'No se pudo completar la operación.'); } finally { setBusy(false); } }
  async function prepare() {
    await run(async () => {
      const value = await apiRequest<{secret: string; uri: string}>('/account/security/setup', {method: 'POST'});
      const qr = await QRCode.toDataURL(value.uri, {width: 240, margin: 2});
      setSetup({secret: value.secret, qr}); setCode(''); setDialog('enable');
    });
  }
  return <>
    {error && !dialog && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    {!security ? <p role="status">{error ? 'No se pudo cargar la seguridad. Actualiza la página para reintentar.' : 'Cargando seguridad…'}</p> : <>
      <section className="info-card account-security-panel">
        <h2>Contraseña</h2>
        <p>{security.hasPassword ? 'Cambia la contraseña con la que accedes a tu cuenta.' : 'Tu cuenta se creó con Google. Para establecer una contraseña, solicita un enlace de recuperación.'}</p>
        {security.hasPassword ? <button className="info-button" onClick={() => { setError(''); setDialog('password'); }}>Cambiar contraseña</button> : <a className="info-button" href="/recuperar-contrasena">Crear contraseña</a>}
      </section>
      <section className="info-card account-security-panel">
        <h2>Verificación en dos pasos</h2>
        <p>Protege tu cuenta con los códigos de Google Authenticator. Al iniciar sesión también te pediremos un código de la app.</p>
        <p><strong>Estado: {security.enabled ? 'Activada' : 'Desactivada'}</strong></p>
        {!security.available && <p>La configuración de Google Authenticator aún no está disponible en el servidor.</p>}
        <button className={security.enabled ? 'info-button danger' : 'primary-button'} disabled={busy || !security.available} onClick={() => { if (security.enabled) { setError(''); setCode(''); setDialog('disable'); } else void prepare(); }}>{busy ? 'Preparando…' : security.enabled ? 'Desactivar verificación' : 'Activar Google Authenticator'}</button>
      </section>
    </>}
    {recovery.length > 0 && <section className="info-card account-security-panel"><h2>Guarda tus códigos de recuperación</h2><p>La verificación ya está activada. Cada código permite entrar una sola vez si pierdes el teléfono. Se muestran únicamente ahora; guárdalos en un lugar seguro.</p><ul className="security-recovery">{recovery.map(value => <li key={value}><code>{value}</code></li>)}</ul><button className="info-button" onClick={() => { const blob = new Blob(['Leñas y Sabores — Códigos de recuperación\nCada código se usa una sola vez.\n\n' + recovery.join('\n')], {type: 'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'lys-codigos-recuperacion.txt'; a.click(); URL.revokeObjectURL(url); }}>Descargar códigos</button><button className="info-button" onClick={() => setRecovery([])}>Ya los guardé</button></section>}
    {dialog && <AccountDialog title={dialog === 'password' ? 'Cambiar contraseña' : dialog === 'enable' ? 'Activar Google Authenticator' : 'Desactivar verificación en dos pasos'} onClose={close}>
      <form className="account-form" aria-busy={busy} onSubmit={event => { event.preventDefault(); void run(async () => {
        if (dialog === 'password') { await changePassword(previous, next); return; }
        if (dialog === 'enable') {
          const value = await apiRequest<{recoveryCodes: string[]}>('/account/security/enable', {method: 'POST', body: JSON.stringify({code})});
          setRecovery(value.recoveryCodes); setSecurity(current => current && {...current, enabled: true});
          setMessage('Verificación en dos pasos activada.');
        } else {
          await apiRequest('/account/security/disable', {method: 'POST', body: JSON.stringify({code})});
          setSecurity(current => current && {...current, enabled: false}); setRecovery([]); setMessage('Verificación en dos pasos desactivada.');
        }
        setDialog(''); setSetup(null); setCode('');
      }); }}>
        {dialog === 'password' ? <><label>Contraseña actual<input type="password" autoComplete="current-password" required value={previous} disabled={busy} onChange={e => setPrevious(e.target.value)} /></label><label>Nueva contraseña<input type="password" autoComplete="new-password" minLength={8} required value={next} disabled={busy} onChange={e => setNext(e.target.value)} /></label></> : <>
          {dialog === 'enable' && setup ? <><p>1. Abre Google Authenticator y selecciona añadir cuenta → Escanear un código QR.</p><img className="security-qr" src={setup.qr} alt="Código QR para configurar Google Authenticator" /><p>También puedes añadirla con esta clave de configuración y elegir códigos basados en tiempo:</p><code className="security-secret">{setup.secret}</code><p>2. Escribe el código de seis dígitos para confirmar la activación.</p></> : <p>Introduce un código nuevo de Google Authenticator o un código de recuperación. Tu cuenta dejará de pedir el segundo paso.</p>}
          <label>{dialog === 'enable' ? 'Código de la aplicación' : 'Código de verificación o recuperación'}<input autoComplete="one-time-code" inputMode={dialog === 'enable' ? 'numeric' : 'text'} pattern={dialog === 'enable' ? '[0-9]{6}' : '[0-9]{6}|[0-9a-f]{16}'} maxLength={dialog === 'enable' ? 6 : 16} value={code} onChange={e => setCode(e.target.value.trim())} required disabled={busy} /></label>
        </>}
        {error && <p role="alert">{error}</p>}
        <div className="account-dialog-actions"><button className="info-button" type="button" disabled={busy} onClick={close}>Cancelar</button><button className="primary-button" type="submit" disabled={busy}>{busy ? 'Guardando…' : dialog === 'password' ? 'Guardar contraseña' : dialog === 'enable' ? 'Confirmar activación' : 'Desactivar'}</button></div>
      </form>
    </AccountDialog>}
  </>;
}
