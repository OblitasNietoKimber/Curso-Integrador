import { useState } from 'react';
import { logout, type SessionUser } from '../../services/session';
import '../../styles/cuenta-personal.css';
import { OperationsDialog } from './OperationsDialog';
import { Icon } from './OperationsVisuals';

export function CuentaPersonal({ user, onNavigate, mobile = false }: {
  user: SessionUser;
  onNavigate: (path: string) => void;
  mobile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function cerrarSesion() {
    setBusy(true); setError('');
    try { await logout(); setOpen(false); onNavigate('/'); }
    catch { setError('No se pudo cerrar la sesión. Inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }
  const role = user.role === 'administrador' ? 'Administrador' : 'Cocina';
  return <>
    <button type="button" className={mobile ? 'cocina-account-mobile personal-account-mobile' : 'ops-side-account cocina-account-trigger personal-account-trigger'}
      aria-label="Abrir mi cuenta" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      {mobile ? <Icon name="user"/> : <>
        <span className="ops-side-avatar" aria-hidden="true">{role.charAt(0)}</span>
        <span className="ops-side-account-info"><strong>{role}</strong><small>Leñas y Sabores</small></span>
        <Icon name="chevron" className="ops-side-account-chevron"/>
      </>}
    </button>
    {open && <OperationsDialog title="Mi cuenta" onClose={() => setOpen(false)} className="ops-profile-modal cocina-account-dialog personal-account-dialog">
      <div className="ops-profile-card">
        <div className="ops-profile-header">
          <div className="ops-profile-avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</div>
          <div className="ops-profile-user">
            <strong className="ops-profile-name">{user.name}</strong>
            <span className="ops-profile-role-badge">{role}</span>
            <span className="ops-profile-brand">Leñas y Sabores</span>
          </div>
        </div>
        <div className="ops-profile-actions-list">
          <button type="button" className="ops-profile-item" onClick={() => { setOpen(false); onNavigate('/'); }}>
            <span className="ops-profile-icon ops-icon-dark"><Icon name="world"/></span>
            <span className="ops-profile-item-text"><strong>Ver sitio público</strong><small>Abre la página de tu restaurante</small></span>
            <Icon name="external-link"/>
          </button>
          <button type="button" className="ops-profile-item personal-account-logout" disabled={busy} onClick={() => void cerrarSesion()}>
            <span className="ops-profile-icon"><Icon name="logout"/></span>
            <span className="ops-profile-item-text"><strong>{busy ? 'Cerrando sesión…' : 'Cerrar sesión'}</strong></span>
            <Icon name="chevron"/>
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </div>
    </OperationsDialog>}
  </>;
}
