import { CuentaPersonal } from '../../components/caja/CuentaPersonal';
import { useSession } from '../../services/session';
import { Icon } from './AdminShared';
import { adminSections, adminPath } from './adminSections';
export function AdminNavigation({slug,onNavigate}:{slug:string;onNavigate:(p:string)=>void}){
 const {user}=useSession(); return <aside className="ops-sidebar" aria-label="Menú del panel"><a className="ops-brand" href="/" onClick={e=>{e.preventDefault();onNavigate('/');}}><img src="/images/logo.webp" alt="Leñas y Sabores"/></a><div className="ops-area-label">Panel de administración</div><nav className="ops-side-navigation" aria-label="Administración">{adminSections.map(s=><button key={s.slug} className={slug===s.slug?'active':''} aria-current={slug===s.slug?'page':undefined} onClick={()=>onNavigate(adminPath(s.slug))}><Icon name={s.icon}/>{s.label}</button>)}</nav><div className="admin-account">{user && <CuentaPersonal user={user} onNavigate={onNavigate}/>}</div></aside>;
}
