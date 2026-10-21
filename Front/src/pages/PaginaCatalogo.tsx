import { useState, useEffect, useMemo } from 'react';
import { Icono } from '../components/Icono';
import { TarjetaProducto } from '../components/catalogo/TarjetaProducto';
import { CategoriasCarta } from '../components/catalogo/CategoriasCarta';
import { OrdenamientoCarta } from '../components/catalogo/OrdenamientoCarta';
import { DetalleProductoModal } from '../components/catalogo/DetalleProductoModal';
import { ServicioCategorias } from '../services/ServicioCategorias';
import { ServicioProductos } from '../services/ServicioProductos';
import { usarCarrito } from '../hooks/usarCarrito';
import type { Categoria, Producto, TipoOrdenamiento } from '../tipos';
import '../styles/carta.css';

interface PropiedadesPaginaCatalogo {
  alNavegar: (ruta: string) => void;
  consultaInicial?: string;
}

const TAMANOS = [
  { id: 'todos', etiqueta: 'Todos los tamaños' },
  { id: 'individual', etiqueta: 'Individual' },
  { id: 'compartir', etiqueta: 'Para compartir' },
  { id: 'familiar', etiqueta: 'Familiar' },
];

export function PaginaCatalogo({ alNavegar, consultaInicial = '' }: PropiedadesPaginaCatalogo) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const parametrosUrl = new URLSearchParams(window.location.search);
  const [categoria, setCategoria] = useState<string>(parametrosUrl.get('categoria') || 'todos');
  const [busqueda, setBusqueda] = useState<string>(parametrosUrl.get('buscar') || consultaInicial);
  const [tamano, setTamano] = useState<string>('todos');
  const [orden, setOrden] = useState<TipoOrdenamiento>('popular');
  const [limiteVisible, setLimiteVisible] = useState(12);

  // Modal y Carrito
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const { agregar, mensajeNotificacion, limpiarMensaje } = usarCarrito();

  // Cargar Categorías
  useEffect(() => {
    ServicioCategorias.obtenerTodas()
      .then(setCategorias)
      .catch(() => {});
  }, []);

  // Cargar Productos desde el backend según filtros
  useEffect(() => {
    setCargando(true);
    setError(null);
    let activo = true;

    ServicioProductos.obtenerTodos({
      categoria,
      tamano,
      buscar: busqueda,
      orden,
    })
      .then(datos => {
        if (activo) {
          setProductos(datos);
          setCargando(false);
        }
      })
      .catch(err => {
        if (activo) {
          setError(err instanceof Error ? err.message : 'Error al cargar productos');
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [categoria, tamano, busqueda, orden]);

  // Actualizar URL cuando cambian filtros principales
  useEffect(() => {
    const params = new URLSearchParams();
    if (categoria !== 'todos') params.set('categoria', categoria);
    if (busqueda.trim()) params.set('buscar', busqueda.trim());
    const nuevoQuery = params.toString();
    const nuevaUrl = `/carta${nuevoQuery ? `?${nuevoQuery}` : ''}`;
    window.history.replaceState(null, '', nuevaUrl);
  }, [categoria, busqueda]);

  const productosVisibles = useMemo(() => {
    return productos.slice(0, limiteVisible);
  }, [productos, limiteVisible]);

  function reiniciarFiltros() {
    setCategoria('todos');
    setBusqueda('');
    setTamano('todos');
    setOrden('popular');
    setLimiteVisible(12);
  }

  return (
    <main id="contenido" className="carta-page">
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

      {/* Hero de Carta */}
      <section className="carta-hero" aria-labelledby="carta-titulo">
        <picture>
          <source media="(max-width: 650px)" srcSet="/images/carta/hero-mobile.webp" />
          <img
            src="/images/carta/hero-desktop.webp"
            alt="Pollo a la brasa con papas fritas y cremas de la casa"
            width="2172"
            height="724"
            fetchPriority="high"
          />
        </picture>
        <div className="carta-hero-copy">
          <h1 id="carta-titulo">
            <span className="sr-only">Nuestra carta</span>
            <picture>
              <source media="(max-width: 650px)" srcSet="/images/carta/title-mobile.webp" />
              <img src="/images/carta/title-desktop.webp" alt="" width="1400" height="470" />
            </picture>
          </h1>
          <p>
            <span className="carta-tagline-desktop">Sabor peruano en cada bocado</span>
            <span className="carta-tagline-mobile">Sabor peruano</span>
          </p>
          <span className="carta-ornament" aria-hidden="true">
            — ◇ —
          </span>
        </div>
      </section>

      <div className="carta-container">
        {/* Barra de Búsqueda Móvil / General */}
        <label className="carta-mobile-search" id="carta-search">
          <Icono name="search" />
          <input
            type="search"
            aria-label="Buscar en la carta"
            placeholder="¿Qué se te antoja hoy? (ej. Pollo, Parrilla, Chaufa...)"
            value={busqueda}
            onChange={e => {
              setBusqueda(e.target.value);
              setLimiteVisible(12);
            }}
          />
        </label>

        {/* Categorías */}
        <CategoriasCarta
          categoriaSeleccionada={categoria}
          alSeleccionar={id => {
            setCategoria(id);
            setLimiteVisible(12);
          }}
          categorias={categorias}
        />

        {/* Ordenamiento */}
        <OrdenamientoCarta ordenActual={orden} alCambiar={setOrden} />

        {/* Filtro de Tamaño */}
        <div className="carta-size-filters" aria-label="Tamaño de porción" style={{ margin: '1.5rem 0' }}>
          {TAMANOS.map(t => (
            <button
              type="button"
              key={t.id}
              className={`carta-size-button ${tamano === t.id ? 'active' : ''}`}
              aria-pressed={tamano === t.id}
              onClick={() => {
                setTamano(t.id);
                setLimiteVisible(12);
              }}
            >
              {t.etiqueta}
            </button>
          ))}
        </div>

        {/* Resultados */}
        <section className="carta-results" aria-labelledby="resultados-titulo">
          <div className="carta-result-meta">
            <p role="status">
              {cargando ? (
                'Cargando platos de la carta…'
              ) : (
                <>
                  <strong>{productos.length}</strong>{' '}
                  {productos.length === 1 ? 'producto encontrado' : 'productos encontrados'}
                  {busqueda && ` para “${busqueda}”`}
                </>
              )}
            </p>
          </div>

          {cargando ? (
            <div className="carta-loading" style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p>Consultando la carta en el servidor…</p>
            </div>
          ) : error ? (
            <div className="carta-no-results">
              <Icono name="close" />
              <h3>Error al cargar los productos</h3>
              <p>{error}</p>
              <button type="button" onClick={reiniciarFiltros}>
                Intentar de nuevo
              </button>
            </div>
          ) : productosVisibles.length > 0 ? (
            <>
              <div className="carta-product-grid">
                {productosVisibles.map(producto => (
                  <TarjetaProducto
                    key={producto.id}
                    producto={producto}
                    alAgregar={id => agregar(id, 1)}
                    alVerDetalle={prod => setProductoSeleccionado(prod)}
                  />
                ))}
              </div>

              {limiteVisible < productos.length && (
                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                  <button
                    type="button"
                    className="carta-load-more"
                    onClick={() => setLimiteVisible(l => l + 12)}
                  >
                    Ver más productos <Icono name="arrow" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="carta-no-results">
              <Icono name="search" />
              <h3>No encontramos ese antojo</h3>
              <p>Prueba con otro término de búsqueda o selecciona otra categoría.</p>
              <button type="button" onClick={reiniciarFiltros}>
                Ver toda la carta
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Modal de Detalle */}
      <DetalleProductoModal
        producto={productoSeleccionado}
        alCerrar={() => setProductoSeleccionado(null)}
        alAgregar={(id, cant) => agregar(id, cant)}
      />
    </main>
  );
}
