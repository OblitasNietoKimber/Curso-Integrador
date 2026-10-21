import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { AuthLayout } from './components/AuthLayout';
import { NoticeDialog, type Notice } from './components/NoticeDialog';
import { AccountPage } from './pages/AccountPage';
import { SignInPage } from './pages/SignInPage';
import { RegisterCard } from './features/auth/RegisterCard';
import { RecoveryCard } from './features/auth/RecoveryCard';
import './styles/login.css';
import './styles/register.css';
import './styles/auth-module.css';
import './styles/auth-responsive.css';

const sections: Record<string, string> = { Inicio: '/', Carta: '/carta', Promociones: '/promociones', Nosotros: '/nosotros', Locales: '/locales', Contacto: '/contacto', 'Pedir ahora': '/carta' };
export default function App() {
  const [route, setRoute] = useState(location.pathname.replace(/\/$/, '') || '/');
  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => { const pop = () => setRoute(location.pathname.replace(/\/$/, '') || '/'); window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop); }, []);
  function navigate(path: string) { history.pushState(null, '', path); setRoute(path); window.scrollTo(0, 0); }
  useEffect(() => { document.title = `${route.startsWith('/mi-cuenta') ? 'Mi cuenta' : route === '/registrarse' ? 'Crear cuenta' : route === '/recuperar-contrasena' ? 'Recuperar contraseña' : 'Iniciar sesión'} | Leñas y Sabores`; }, [route]);
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <Header activeSection="" onSection={section => { const path = sections[section]; if (path === '/') navigate('/'); else setNotice({ title: section, message: 'Esta sección estará disponible próximamente.' }); }} />
    <div className="auth-preview-bar"><span>{route.startsWith('/mi-cuenta') ? 'Mi cuenta de ejemplo · los cambios se restablecen al recargar' : 'Vista previa de interfaces'}</span><a href="/mi-cuenta" onClick={event => { event.preventDefault(); navigate('/mi-cuenta'); }}>Ver Mi cuenta</a></div>
    {route.startsWith('/mi-cuenta') ? <AccountPage key={route} route={route} onNavigate={navigate} /> : route === '/registrarse' ? <AuthLayout registration><RegisterCard onLogin={() => navigate('/iniciar-sesion')} onLegal={kind => setNotice({ title: kind === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad', message: 'Contenido de referencia del prototipo. Los textos legales definitivos se incorporarán antes de habilitar el registro. En esta vista previa no se crean cuentas ni se envían datos.' })} /></AuthLayout>
      : route === '/recuperar-contrasena' ? <AuthLayout><RecoveryCard onLogin={() => navigate('/iniciar-sesion')} /></AuthLayout>
      : <SignInPage onHelp={action => navigate(action === 'register' ? '/registrarse' : '/recuperar-contrasena')} />}
    <NoticeDialog notice={notice} onClose={() => setNotice(null)} />
  </>;
}
