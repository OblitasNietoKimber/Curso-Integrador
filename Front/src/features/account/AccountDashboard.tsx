import { Icon } from '../../components/Icon';
import { useAccount } from './accountStore';
import { AccountEmpty } from './AccountShared';
export function AccountDashboard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const account = useAccount();
  const stats = [{ label: 'Pedidos', value: 0, icon: 'receipt', slug: 'pedidos', color: 'red' }, { label: 'Direcciones', value: account.addresses.length, icon: 'pin', slug: 'direcciones', color: 'blue' }, { label: 'Favoritos', value: 0, icon: 'heart', slug: 'favoritos', color: 'orange' }, { label: 'Notificaciones', value: 0, icon: 'bell', slug: 'notificaciones', color: 'purple' }] as const;
  return <div className="account-dashboard"><div className="account-stats">{stats.map(s => <button className="info-card" key={s.slug} onClick={() => onNavigate(`/mi-cuenta/${s.slug}`)}><span className={`info-icon-circle tone-${s.color}`}><Icon name={s.icon} /></span><span><strong>{s.value}</strong><small>{s.label}</small></span><Icon name="chevron" /></button>)}</div>
    <div className="account-dashboard-top"><section className="info-card"><h2>Tu cuenta</h2><p>Gestiona tu información y tus preferencias.</p><button className="info-button" onClick={() => onNavigate('/mi-cuenta/datos')}>Editar mis datos <Icon name="arrow" /></button></section><section className="info-card"><h2>Dirección predeterminada</h2><p>{account.addresses.find(a => a.primary)?.street || 'Aún no tienes una dirección guardada.'}</p><button className="info-button" onClick={() => onNavigate('/mi-cuenta/direcciones')}>Gestionar direcciones</button></section></div>
    <AccountEmpty title="Aún no tienes pedidos" description="Aquí aparecerán tus pedidos cuando realices tu primera compra." />
  </div>;
}
