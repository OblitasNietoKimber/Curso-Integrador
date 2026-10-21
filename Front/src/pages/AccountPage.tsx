import { useState } from 'react';
import { AccountNavigation } from '../features/account/AccountNavigation';
import { AccountDashboard } from '../features/account/AccountDashboard';
import { AccountProfileForm } from '../features/account/AccountProfileForm';
import { AccountAddresses } from '../features/account/AccountAddresses';
import { AccountPayments } from '../features/account/AccountPayments';
import { AccountNotifications } from '../features/account/AccountNotifications';
import { AccountDialog, AccountEmpty } from '../features/account/AccountShared';
import { accountSections, accountPath } from '../features/account/accountSections';
import { useAccount, useAccountFeedback } from '../features/account/accountStore';
import { logout } from '../services/session';
import { displayFirstName } from '../services/displayName';
import '../styles/account.css';
import '../styles/account-preview.css';
export function AccountPage({ route, onNavigate }: { route: string; onNavigate: (path: string) => void }) {
  const { profile } = useAccount();
  const feedback = useAccountFeedback();
  const [logoutError, setLogoutError] = useState('');
  const section = accountSections.find(s => accountPath(s.slug) === route) || accountSections[0];
  const [leaving, setLeaving] = useState(false);
  return <main id="contenido" className={`account-page account-section-${section.slug || 'inicio'}`}><div className="account-container">
    <nav className="account-breadcrumb" aria-label="Ruta actual"><button onClick={() => onNavigate('/')}>Inicio</button><span>›</span><button onClick={() => onNavigate('/mi-cuenta')}>Mi cuenta</button><span>›</span><span aria-current="page">{section.label}</span></nav>
    <p role="status">{feedback.saving ? 'Guardando cambios…' : ''}</p>{feedback.error && <p role="alert">{feedback.error}</p>}<div className="account-layout"><AccountNavigation slug={section.slug} onNavigate={onNavigate} onLogout={() => setLeaving(true)} /><div className="account-content" inert={feedback.saving}>
      {section.slug !== 'datos' && <header className="account-page-heading"><h1>{section.slug === '' ? `Hola, ${displayFirstName(profile.name)}` : section.label}</h1><p>{section.description}</p></header>}
      {section.slug === '' ? <AccountDashboard onNavigate={onNavigate} /> : section.slug === 'datos' ? <AccountProfileForm onNavigate={onNavigate} /> : section.slug === 'direcciones' ? <AccountAddresses /> : section.slug === 'metodos-pago' ? <AccountPayments /> : section.slug === 'notificaciones' ? <AccountNotifications onNavigate={onNavigate} /> : section.slug === 'favoritos' ? <AccountEmpty title="Aún no tienes favoritos" description="Los platos que marques como favoritos aparecerán aquí." /> : section.slug === 'pedidos' ? <AccountEmpty title="Aún no tienes pedidos" description="Aquí podrás consultar el historial y el estado de tus pedidos." /> : <section className="info-card preview-address"><h2>Salir de tu cuenta</h2><button className="primary-button" onClick={() => setLeaving(true)}>Cerrar sesión</button></section>}
    </div></div>
  </div>{leaving && <AccountDialog title="Cerrar sesión" onClose={() => setLeaving(false)}><p>¿Deseas cerrar tu sesión?</p>{logoutError && <p role="alert">{logoutError}</p>}<div className="account-dialog-actions"><button className="info-button" onClick={() => setLeaving(false)}>Cancelar</button><button className="primary-button" onClick={() => { void logout().then(() => onNavigate('/iniciar-sesion')).catch(error => setLogoutError(error.message)); }}>Cerrar sesión</button></div></AccountDialog>}</main>;
}
