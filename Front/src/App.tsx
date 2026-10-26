import { useEffect, useState } from 'react';
import { BarraNavegacion } from './components/BarraNavegacion';
import { NavegacionInferior } from './components/NavegacionInferior';
import { PaginaInicio } from './pages/PaginaInicio';
import { PaginaCatalogo } from './pages/PaginaCatalogo';
import { PaginaPromociones } from './pages/PaginaPromociones';
import { PaginaCarrito } from './pages/PaginaCarrito';
import { PiePagina } from './components/PiePagina';
import { Header } from './components/Header';
import Caja from './components/caja/Caja';
import { AuthLayout } from './components/AuthLayout';
import { NoticeDialog, type Notice } from './components/NoticeDialog';
import { AccountPage } from './pages/AccountPage';
import { SignInPage } from './pages/SignInPage';
import { RegisterCard } from './features/auth/RegisterCard';
import { ResetPasswordCard } from './features/auth/ResetPasswordCard';
import { useSession, refreshSession, getSessionUser } from './services/session';
import { RecoveryCard } from './features/auth/RecoveryCard';
import './styles/login.css';
import './styles/register.css';
import './styles/auth-module.css';
import './styles/auth-responsive.css';

const sections: Record<string, string> = { Inicio: '/', Carta: '/carta', Promociones: '/promociones', 'Pedir ahora': '/carta' };
export default function App() {
  const session = useSession();
  const [query, setQuery] = useState('');
  const [route, setRoute] = useState(location.pathname.replace(/\/$/, '') || '/');
  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => { const pop = () => setRoute(location.pathname.replace(/\/$/, '') || '/'); window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop); }, []);
  useEffect(() => {
    void refreshSession();
    const success = () => {
      const returnPath = localStorage.getItem('lys-return-after-login');
      if (returnPath) {
        localStorage.removeItem('lys-return-after-login');
        history.pushState(null, '', returnPath);
        setRoute(returnPath);
        window.scrollTo(0, 0);
        return;
      }
      const user = getSessionUser();
      const canUseCaja = user && ['caja', 'administrador'].includes(user.role);
      const destino = new URLSearchParams(location.search).get('destino') === 'caja' && canUseCaja
        ? '/caja'
        : user && user.role !== 'cliente' ? '/' : '/mi-cuenta';
      history.pushState(null, '', destino);
      setRoute(destino);
      window.scrollTo(0, 0);
    };
    const expired = () => {
      if (location.pathname.startsWith('/mi-cuenta') || location.pathname.startsWith('/caja')) {
        history.replaceState(null, '', '/iniciar-sesion');
        setRoute('/iniciar-sesion');
      }
    };
    window.addEventListener('lys-login-success', success);
    window.addEventListener('lys-session-expired', expired);
    return () => {
      window.removeEventListener('lys-login-success', success);
      window.removeEventListener('lys-session-expired', expired);
    };
  }, []);

  function navigate(path: string) { history.pushState(null, '', path); setRoute(path.split('?')[0]); window.scrollTo(0, 0); }
  useEffect(() => { document.title = `${route.startsWith('/caja') ? 'Caja' : route.startsWith('/mi-cuenta') ? 'Mi cuenta' : route === '/registrarse' ? 'Crear cuenta' : route === '/recuperar-contrasena' ? 'Recuperar contraseña' : route === '/' ? 'Inicio' : route === '/carta' ? 'Carta' : route === '/promociones' ? 'Promociones' : route === '/carrito' ? 'Carrito' : 'Iniciar sesión'} | Leñas y Sabores`; }, [route]);
  if(route === '/caja' || route.startsWith('/caja/')) return <Caja onNavigate={navigate}/>;
  const publicPage = ['/', '/carta', '/promociones', '/carrito'].includes(route);
  const active = route === '/carta' ? 'Carta' : route === '/promociones' ? 'Promociones' : route === '/carrito' ? 'Carrito' : 'Inicio';
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    {publicPage ? <BarraNavegacion seccionActiva={active} alNavegar={navigate} busqueda={{ consulta: query, alBuscar: value => { setQuery(value); if (route !== '/carta') navigate('/carta?buscar=' + encodeURIComponent(value)); } }} /> : <Header activeSection="" onSection={section => { const path = sections[section]; if (['/', '/carta', '/promociones'].includes(path)) navigate(path); else setNotice({ title: section, message: 'Esta sección estará disponible próximamente.' }); }} />}

    {route === '/' ? <PaginaInicio alNavegar={navigate} /> : route === '/carta' ? <PaginaCatalogo alNavegar={navigate} consultaInicial={query} /> : route === '/promociones' ? <PaginaPromociones /> : route === '/carrito' ? <PaginaCarrito alNavegar={navigate} /> : route.startsWith('/mi-cuenta') ? session.loading ? <main id="contenido" className="base-page" role="status">Cargando tu cuenta…</main> : session.error ? <main id="contenido" className="base-page"><p role="alert">{session.error}</p><button onClick={() => void refreshSession()}>Reintentar</button><button onClick={() => navigate('/iniciar-sesion')}>Iniciar sesión</button></main> : session.user ? <AccountPage key={route} route={route} onNavigate={navigate} /> : <main id="contenido" className="base-page" role="status">Abriendo inicio de sesión…</main> : route === '/registrarse' ? <AuthLayout registration><RegisterCard onLogin={() => navigate('/iniciar-sesion')} onLegal={kind => setNotice({ title: kind === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad', message: 'Textos legales en preparación para el proyecto académico. El registro crea una cuenta de cliente. La información se guarda en el servidor del proyecto.' })} /></AuthLayout>
      : route === '/restablecer-contrasena' ? <AuthLayout><ResetPasswordCard onLogin={() => navigate('/iniciar-sesion')} /></AuthLayout>
      : route === '/recuperar-contrasena' ? <AuthLayout><RecoveryCard onLogin={() => navigate('/iniciar-sesion')} /></AuthLayout>
      : <SignInPage onHelp={action => navigate(action === 'register' ? '/registrarse' : '/recuperar-contrasena')} />}
    {['/', '/carta', '/promociones', '/carrito'].includes(route) && <PiePagina alNavegar={navigate} />}
    {publicPage && <NavegacionInferior activa={active} alNavegar={navigate} />}
    <NoticeDialog notice={notice} onClose={() => setNotice(null)} />
  </>;
}
