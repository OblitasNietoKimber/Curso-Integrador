import { useState, useEffect } from 'react';
import { Icono } from '../components/Icono';
import { TarjetaPromocion } from '../components/promociones/TarjetaPromocion';
import { ServicioPromociones } from '../services/ServicioPromociones';
import { usarCarrito } from '../hooks/usarCarrito';
import type { Promocion } from '../tipos';
import '../styles/carta.css';
import '../styles/promotions.css';

const CATEGORIAS_PROMO = [
  { id: 'todas', etiqueta: 'Todas las promos' },
  { id: 'combos', etiqueta: 'Combos' },
  { id: 'familiares', etiqueta: 'Familiares' },
  { id: 'individuales', etiqueta: 'Individuales' },
  { id: 'bebidas', etiqueta: 'Bebidas' },
  { id: 'acompanamientos', etiqueta: 'Acompañamientos' },
];

export function PaginaPromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [categoria, setCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { agregar, mensajeNotificacion, limpiarMensaje } = usarCarrito();

  useEffect(() => {
    let activo = true;

    ServicioPromociones.obtenerTodas({
      categoria,
      buscar: busqueda,
    })
      .then(datos => {
        if (activo) {
          setPromociones(datos);
          setCargando(false);
        }
      })
      .catch(err => {
        if (activo) {
          setError(err instanceof Error ? err.message : 'Error al cargar promociones');
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [categoria, busqueda]);

  return (
    <main className="promotions-page" id="contenido">
      {/* Notificación flotante de carrito */}
      {mensajeNotificacion && (
        <aside
          className="carta-toast"
          role="status"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            backgroundColor: '#2e7d32',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Icono name="check" />
          <span>{mensajeNotificacion}</span>
          <button
            type="button"
            onClick={limpiarMensaje}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              marginLeft: '8px',
            }}
          >
            ✕
          </button>
        </aside>
      )}

      {/* Hero de Promociones */}
      <section className="promotions-hero" aria-labelledby="promociones-titulo">
        <picture className="promotions-hero-background">
          <source media="(max-width: 650px)" srcSet="/images/promotions/hero-mobile-v2.webp" />
          <img
            src="/images/promotions/hero-desktop-v3.webp"
            alt="Pollo a la brasa y papas en promociones especiales"
            width="1920"
            height="360"
            fetchPriority="high"
          />
        </picture>
        <div className="promotions-hero-copy">
          <h1 id="promociones-titulo">
            <span className="sr-only">Promociones que encienden el antojo</span>
            <img src="/images/promotions/title.webp" alt="" width="1200" height="420" />
          </h1>
          <p>Sabores de temporada y grandes ahorros por tiempo limitado</p>
        </div>
      </section>

      <div className="promotions-container">
        {/* Barra de Búsqueda */}
        <label className="carta-mobile-search" id="promociones-search">
          <Icono name="search" />
          <input
            type="search"
            aria-label="Buscar promociones"
            placeholder="Buscar entre las promociones…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </label>

        {/* Categorías de Promociones */}
        <div className="carta-size-filters" aria-label="Categorías de ofertas" style={{ margin: '1.5rem 0' }}>
          {CATEGORIAS_PROMO.map(cat => (
            <button
              type="button"
              key={cat.id}
              className={`carta-size-button ${categoria === cat.id ? 'active' : ''}`}
              aria-pressed={categoria === cat.id}
              onClick={() => setCategoria(cat.id)}
            >
              {cat.etiqueta}
            </button>
          ))}
        </div>

        {/* Listado de Ofertas */}
        <section aria-label="Ofertas disponibles">
          {cargando ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.7)' }}>
              <p>Consultando promociones vigentes en el servidor…</p>
            </div>
          ) : error ? (
            <div className="carta-no-results">
              <Icono name="close" />
              <h3>Error al consultar promociones</h3>
              <p>{error}</p>
            </div>
          ) : promociones.length > 0 ? (
            <div className="promo-offer-grid">
              {promociones.map(promo => (
                <TarjetaPromocion
                  key={promo.id}
                  promocion={promo}
                  alAgregar={(id, cant) => agregar(id, cant)}
                />
              ))}
            </div>
          ) : (
            <div className="carta-no-results">
              <Icono name="search" />
              <h2>No encontramos esa promoción</h2>
              <p>Prueba con otro término o selecciona otra categoría.</p>
              <button
                type="button"
                onClick={() => {
                  setCategoria('todas');
                  setBusqueda('');
                }}
              >
                Ver todas las promociones
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
