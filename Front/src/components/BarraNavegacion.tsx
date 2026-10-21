import { useState, useEffect } from 'react';
import { Icono } from './Icono';
import { usarCarrito } from '../hooks/usarCarrito';

interface PropiedadesBarraNavegacion {
  seccionActiva: string;
  alNavegar: (ruta: string) => void;
  busqueda?: {
    consulta: string;
    alBuscar: (texto: string) => void;
  };
}

const seccionesPublicas = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Carta', ruta: '/carta' },
  { nombre: 'Promociones', ruta: '/promociones' },
];

export function BarraNavegacion({
  seccionActiva,
  alNavegar,
  busqueda,
}: PropiedadesBarraNavegacion) {
  const { cantidadTotal } = usarCarrito();
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    if (!menuAbierto) return;
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setMenuAbierto(false);
    };
    document.addEventListener('keydown', cerrarConEscape);
    return () => document.removeEventListener('keydown', cerrarConEscape);
  }, [menuAbierto]);

  function navegarA(ruta: string) {
    setMenuAbierto(false);
    alNavegar(ruta);
  }

  return (
    <header className="site-header carta-header">
      <a
        className="brand"
        href="/"
        aria-label="Leñas y Sabores, inicio"
        onClick={evento => {
          evento.preventDefault();
          navegarA('/');
        }}
      >
        <img
          src="/images/logo.webp"
          alt="Leñas y Sabores — Pollos & Parrillas"
          width="2048"
          height="682"
        />
      </a>

      {/* Navegación Escritorio */}
      <nav className="desktop-nav" aria-label="Navegación principal">
        {seccionesPublicas.map(seccion => (
          <button
            key={seccion.nombre}
            type="button"
            className={seccion.nombre === seccionActiva ? 'nav-link active' : 'nav-link'}
            aria-current={seccion.nombre === seccionActiva ? 'page' : undefined}
            onClick={() => navegarA(seccion.ruta)}
          >
            {seccion.nombre}
          </button>
        ))}
      </nav>

      {/* Acciones del Header */}
      <div className="header-actions">
        {busqueda && (
          <>
            <label className="carta-header-search">
              <Icono name="search" />
              <input
                type="search"
                aria-label="Buscar productos"
                placeholder="Buscar productos…"
                value={busqueda.consulta}
                onChange={e => busqueda.alBuscar(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="carta-search-toggle"
              aria-label="Buscar en la carta"
              onClick={() => {
                const el = document.getElementById('carta-search');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Icono name="search" />
            </button>
          </>
        )}

        {/* Botón Carrito con contador sincronizado */}
        <button
          type="button"
          className="carta-cart-toggle"
          aria-label={`Ver carrito, ${cantidadTotal} productos seleccionados`}
          onClick={() => navegarA('/carrito')}
        >
          <Icono name="cart" />
          {cantidadTotal > 0 && <span className="cart-badge">{cantidadTotal}</span>}
        </button>

        <span className="header-divider" aria-hidden="true" />

        {/* Botón Pedir Ahora -> Lleva al carrito */}
        <button
          type="button"
          className="order-button"
          aria-label="Pedir ahora"
          onClick={() => navegarA('/carrito')}
        >
          <span className="order-glare" aria-hidden="true" />
          <Icono name="cart" />
          <span>Pedir ahora</span>
        </button>

        {/* Interruptor Menú Móvil */}
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuAbierto}
          aria-controls="navegacion-movil"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <Icono name={menuAbierto ? 'close' : 'menu'} />
        </button>
      </div>

      {/* Menú Móvil Desplegable */}
      <nav
        id="navegacion-movil"
        className={`mobile-nav ${menuAbierto ? 'open' : ''}`}
        aria-label="Navegación móvil"
        hidden={!menuAbierto}
      >
        {seccionesPublicas.map(seccion => (
          <button
            type="button"
            key={seccion.nombre}
            className={seccion.nombre === seccionActiva ? 'active' : ''}
            onClick={() => navegarA(seccion.ruta)}
          >
            {seccion.nombre}
          </button>
        ))}
        <button
          type="button"
          className="mobile-cart-btn"
          onClick={() => navegarA('/carrito')}
        >
          <Icono name="cart" /> Carrito ({cantidadTotal})
        </button>
      </nav>
    </header>
  );
}
