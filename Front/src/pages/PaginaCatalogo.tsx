import { useState, useEffect, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { TarjetaProducto } from '../components/catalogo/TarjetaProducto';
import { CategoriasCarta } from '../components/catalogo/CategoriasCarta';
import { OrdenamientoCarta } from '../components/catalogo/OrdenamientoCarta';
import { defaultSorting, type SortOptionId } from '../constants/sorting';
import { DetalleProductoModal } from '../components/catalogo/DetalleProductoModal';
import { ServicioCategorias } from '../services/ServicioCategorias';
import { ServicioProductos } from '../services/ServicioProductos';
import { usarCarrito } from '../hooks/usarCarrito';
import type { Categoria, Producto, TipoOrdenamiento } from '../tipos';

interface PropiedadesPaginaCatalogo {
  alNavegar: (ruta: string) => void;
  consultaInicial?: string;
}

export function PaginaCatalogo({ alNavegar: _alNavegar, consultaInicial = '' }: PropiedadesPaginaCatalogo) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const parametrosUrl = new URLSearchParams(window.location.search);
  const [categoria, setCategoria] = useState<string>(parametrosUrl.get('categoria') || 'todos');
  const [busqueda, setBusqueda] = useState<string>(parametrosUrl.get('buscar') || consultaInicial);
  const [tamano, setTamano] = useState<string>('todos');
  const [sort, setSort] = useState<SortOptionId>('popular');
  const [limiteVisible, setLimiteVisible] = useState(12);
  const [favoritosSolo, setFavoritosSolo] = useState(false);
  const [favoritos, setFavoritos] = useState<string[]>(() => {
    try {
      const guardados = localStorage.getItem('lys-favoritos');
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  });

  const [detalle, setDetalle] = useState<Producto | null>(null);
  const { agregar } = usarCarrito();

  // Guardar favoritos
  function toggleFavorito(id: string) {
    setFavoritos(prev => {
      const nuevo = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('lys-favoritos', JSON.stringify(nuevo));
      } catch {}
      return nuevo;
    });
  }

  // Cargar Categorías
  useEffect(() => {
    ServicioCategorias.obtenerTodas()
      .then(setCategorias)
      .catch(() => {});
  }, []);

  // Map sort option to backend order
  const ordenBackend: TipoOrdenamiento =
    sort === 'price' ? 'precio_asc' : sort === 'new' ? 'nuevo' : 'popular';

  // Cargar Productos desde el backend
  useEffect(() => {
    let activo = true;

    ServicioProductos.obtenerTodos({
      categoria,
      tamano,
      buscar: busqueda,
      orden: ordenBackend,
    })
      .then(datos => {
        if (activo) {
          setProductos(datos);
          setCargando(false);
        }
      })
      .catch(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [categoria, tamano, busqueda, ordenBackend]);

  // Actualizar URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (categoria !== 'todos') params.set('categoria', categoria);
    if (busqueda.trim()) params.set('buscar', busqueda.trim());
    const nuevoQuery = params.toString();
    const nuevaUrl = `/carta${nuevoQuery ? `?${nuevoQuery}` : ''}`;
    window.history.replaceState(null, '', nuevaUrl);
  }, [categoria, busqueda]);

  // Filtrado local por favoritos y promociones si sort === 'promo'
  const productosFiltrados = useMemo(() => {
    let resultado = productos;
    if (favoritosSolo) {
      resultado = resultado.filter(p => favoritos.includes(p.id));
    }
    if (sort === 'promo') {
      resultado = [...resultado].sort((a, b) => Number(b.esPromocion) - Number(a.esPromocion));
    }
    return resultado;
  }, [productos, favoritosSolo, favoritos, sort]);

  const visibles = useMemo(() => {
    return productosFiltrados.slice(0, limiteVisible);
  }, [productosFiltrados, limiteVisible]);

  function reiniciar() {
    setCategoria('todos');
    setBusqueda('');
    setTamano('todos');
    setSort('popular');
    setFavoritosSolo(false);
    setLimiteVisible(12);
  }

  const nombreCategoriaActiva =
    categoria === 'todos'
      ? 'Nuestros platos'
      : categorias.find(c => c.id === categoria)?.nombre || 'Nuestros platos';

  return (
    <>
      <main id="contenido" className="carta-page">
        <section className="carta-hero" aria-labelledby="carta-title">
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
            <h1 id="carta-title">
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
          <label className="carta-mobile-search" id="carta-search">
            <Icon name="search" />
            <input
              type="search"
              aria-label="Buscar en la carta"
              placeholder="¿Qué se te antoja hoy?"
              value={busqueda}
              onChange={event => {
                setBusqueda(event.target.value);
                setLimiteVisible(12);
              }}
            />
          </label>

          <div className="carta-toolbar">
            <CategoriasCarta
              categoriaSeleccionada={categoria}
              alSeleccionar={id => {
                setCategoria(id);
                setLimiteVisible(12);
              }}
              categorias={categorias}
            />
            <OrdenamientoCarta
              value={sort}
              onChange={value => {
                setSort(value);
                setLimiteVisible(12);
              }}
            />
          </div>

          <div className="carta-mobile-sorting" aria-label="Ordenar productos">
            {defaultSorting.map(option => (
              <button
                key={option.id}
                type="button"
                aria-pressed={sort === option.id}
                onClick={() => {
                  setSort(option.id);
                  setLimiteVisible(12);
                }}
              >
                <Icon name={option.icon} />
                {option.name}
              </button>
            ))}
          </div>

          <section className="carta-results" aria-labelledby="carta-results-title">
            <div className="carta-results-heading">
              <h2 id="carta-results-title">{nombreCategoriaActiva}</h2>
              <div className="carta-size-filters" aria-label="Tamaño de porción">
                {[
                  ['todos', 'Todos los tamaños'],
                  ['individual', 'Individual'],
                  ['compartir', 'Para compartir'],
                  ['familiar', 'Familiar'],
                ].map(([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    aria-pressed={tamano === id}
                    onClick={() => {
                      setTamano(id);
                      setLimiteVisible(12);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="carta-result-meta">
              <p role="status">
                {cargando ? (
                  'Cargando productos…'
                ) : (
                  <>
                    {productosFiltrados.length}{' '}
                    {productosFiltrados.length === 1 ? 'producto' : 'productos'}
                    {busqueda && ` para “${busqueda}”`}
                  </>
                )}
              </p>
              <button
                type="button"
                className="carta-favorites-filter"
                aria-pressed={favoritosSolo}
                onClick={() => setFavoritosSolo(!favoritosSolo)}
              >
                <Icon name="heart" />
                Mis favoritos
              </button>
            </div>

            {visibles.length > 0 ? (
              <>
                <div className="carta-product-grid">
                  {visibles.map(producto => (
                    <TarjetaProducto
                      key={producto.id}
                      producto={producto}
                      favorito={favoritos.includes(producto.id)}
                      alFavorito={() => toggleFavorito(producto.id)}
                      alAgregar={id => agregar(id, 1)}
                      alVerDetalle={prod => setDetalle(prod)}
                    />
                  ))}
                </div>
                {visibles.length < productosFiltrados.length && (
                  <button
                    type="button"
                    className="carta-load-more"
                    onClick={() => setLimiteVisible(l => l + 12)}
                  >
                    Ver más productos <Icon name="arrow" />
                  </button>
                )}
              </>
            ) : !cargando ? (
              <div className="carta-no-results">
                <Icon name="search" />
                <h3>No encontramos ese antojo</h3>
                <p>Prueba con otro nombre o cambia los filtros.</p>
                <button type="button" onClick={reiniciar}>
                  Ver toda la carta
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <DetalleProductoModal
        producto={detalle}
        alCerrar={() => setDetalle(null)}
        alAgregar={id => agregar(id, 1)}
      />
    </>
  );
}
