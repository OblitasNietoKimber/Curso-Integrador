import { useState } from 'react';
import type { SessionUser } from '../../services/session';
import { OperationsDialog } from '../caja/OperationsDialog';
import { Icon } from '../caja/OperationsVisuals';

export function CuentaCocina({ user, onNavigate, mobile = false }: {
  user: SessionUser;
  onNavigate: (path: string) => void;
  mobile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const role = user.role === 'administrador' ? 'Administrador' : 'Cocina';
  return <>
    <button type="button" className={mobile ? 'cocina-account-mobile' : 'ops-side-account cocina-account-trigger'}
      aria-label="Abrir mi cuenta" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      {mobile ? <Icon name="user"/> : <>
        <span className="ops-side-avatar" aria-hidden="true">{role.charAt(0)}</span>
        <span className="ops-side-account-info"><strong>{role}</strong><small>Leñas y Sabores</small></span>
        <Icon name="chevron" className="ops-side-account-chevron"/>
      </>}
    </button>
    {open && <OperationsDialog title="Mi cuenta" onClose={() => setOpen(false)} className="ops-profile-modal cocina-account-dialog">
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
        </div>
      </div>
    </OperationsDialog>}
  </>;
}
