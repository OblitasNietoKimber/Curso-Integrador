import { useState, useEffect } from 'react';
import { useSession } from '../services/session';
import { useAccount } from '../features/account/accountStore';
import { displayFirstName } from '../services/displayName';
import { Icon } from './Icon';
import { usarCarrito } from '../hooks/usarCarrito';

interface PropiedadesBarraNavegacion {
  seccionActiva: string;
  alNavegar: (ruta: string) => void;
  busqueda?: {
    consulta: string;
    alBuscar: (texto: string) => void;
  };
}

const sections = [
  { name: 'Inicio', path: '/' },
  { name: 'Carta', path: '/carta' },
  { name: 'Promociones', path: '/promociones' },
];

export function BarraNavegacion({
  seccionActiva,
  alNavegar,
  busqueda,
}: PropiedadesBarraNavegacion) {
  const { user } = useSession();
  const sectionsVisibles = user && ['caja','administrador'].includes(user.role.toLowerCase()) ? [...sections, {name:'Caja',path:'/caja'}] : sections;
  const { profile } = useAccount();
  const { cantidadTotal } = usarCarrito();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  function navigate(path: string) {
    setMenuOpen(false);
    alNavegar(path);
  }

  return (
    <header className="site-header carta-header">
      <a
        className="brand"
        href="/"
        aria-label="Leñas y Sabores, inicio"
        onClick={e => {
          e.preventDefault();
          navigate('/');
        }}
      >
        <img
          src="/images/logo.webp"
          alt="Leñas y Sabores — Pollos & Parrillas"
          width="2048"
          height="682"
        />
      </a>

      <nav className="desktop-nav" aria-label="Navegación principal">
        {sectionsVisibles.map(section => (
          <button
            key={section.name}
            type="button"
            className={section.name === seccionActiva ? 'nav-link active' : 'nav-link'}
            aria-current={section.name === seccionActiva ? 'page' : undefined}
            onClick={() => navigate(section.path)}
          >
            {section.name}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        {busqueda && (
          <>
            <label className="carta-header-search">
              <Icon name="search" />
              <input
                type="search"
                aria-label="Buscar productos"
                placeholder="Buscar productos…"
                value={busqueda.consulta}
                onChange={event => busqueda.alBuscar(event.target.value)}
              />
            </label>
            <a
              href="#carta-search"
              className="carta-search-toggle"
              aria-label="Buscar en la carta"
              onClick={e => {
                if (window.location.pathname !== '/carta') {
                  e.preventDefault();
                  navigate('/carta#carta-search');
                }
              }}
            >
              <Icon name="search" />
            </a>
            <button
              type="button"
              className="carta-cart-toggle"
              aria-label={`Ver pedido, ${cantidadTotal} productos`}
              onClick={() => navigate('/carrito')}
            >
              <Icon name="cart" />
              {cantidadTotal > 0 && <span>{cantidadTotal}</span>}
            </button>
          </>
        )}

        <a
          className="login-link"
          aria-label={user ? "Mi cuenta" : "Iniciar Sesión"}
          href={user ? "/mi-cuenta" : "/iniciar-sesion"}
          onClick={e => {
            e.preventDefault();
            navigate(user ? '/mi-cuenta' : '/iniciar-sesion');
          }}
        >
          <Icon name="user" />
          <span>{user ? displayFirstName(profile.name || user.name) : 'Iniciar Sesión'}</span>
        </a>

        <span className="header-divider" aria-hidden="true" />

        <button
          type="button"
          className="order-button"
          aria-label="Pedir ahora"
          onClick={() => navigate('/carrito')}
        >
          <span className="order-glare" aria-hidden="true" />
          <Icon name="cart" />
          <span>Pedir ahora</span>
        </button>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
      </div>

      <nav
        id="mobile-navigation"
        className="mobile-nav"
        aria-label="Navegación móvil"
        hidden={!menuOpen}
      >
        {sectionsVisibles.map(section => (
          <button
            type="button"
            key={section.name}
            onClick={() => navigate(section.path)}
          >
            {section.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => navigate('/carrito')}
        >
          Carrito ({cantidadTotal})
        </button>
        <a
          href={user ? "/mi-cuenta" : "/iniciar-sesion"}
          onClick={e => {
            e.preventDefault();
            navigate(user ? '/mi-cuenta' : '/iniciar-sesion');
          }}
        >
          {user ? 'Mi cuenta' : 'Iniciar Sesión'}
        </a>
      </nav>
    </header>
  );
}
