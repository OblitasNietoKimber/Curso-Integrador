import { useState, useEffect, useMemo } from 'react';
import { Icon, type IconName } from '../components/Icon';
import { EmberTrail } from '../components/EmberTrail';
import { TarjetaPromocion } from '../components/promociones/TarjetaPromocion';
import { CategoriasCarta } from '../components/catalogo/CategoriasCarta';
import { OrdenamientoCarta } from '../components/catalogo/OrdenamientoCarta';
import { ServicioPromociones } from '../services/ServicioPromociones';
import { usarCarrito } from '../hooks/usarCarrito';
import type { Promocion } from '../tipos';

const promotionCategories: { id: string; label: string; icon: IconName }[] = [
  { id: 'todas', label: 'Todas', icon: 'grid' },
  { id: 'combos', label: 'Combos', icon: 'chicken' },
  { id: 'familiares', label: 'Familiares', icon: 'users' },
  { id: 'individuales', label: 'Individuales', icon: 'user' },
  { id: 'bebidas', label: 'Bebidas', icon: 'drink' },
  { id: 'acompanamientos', label: 'Acompañamientos', icon: 'fries' },
];

const promotionLabels = [
  { id: 'halloween', name: 'EDICIÓN HALLOWEEN', icon: 'pumpkin' as const, tone: 'orange' as const },
  { id: 'popular', name: 'LA MÁS PEDIDA', icon: 'flame' as const, tone: 'red' as const },
  { id: 'seasonal', name: 'SOLO POR TEMPORADA', icon: 'clock' as const, tone: 'orange' as const },
];

export function PaginaPromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [categoria, setCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [labelOrder, setLabelOrder] = useState('halloween');
  const [limit, setLimit] = useState(6);
  const [cargando, setCargando] = useState(true);

  const { agregar } = usarCarrito();

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
      .catch(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [categoria, busqueda]);

  const filtradas = useMemo(() => {
    const targetBadge = promotionLabels.find(l => l.id === labelOrder)?.name;
    return [...promociones].sort((a, b) => {
      const aMatch = a.insignia === targetBadge ? 1 : 0;
      const bMatch = b.insignia === targetBadge ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [promociones, labelOrder]);

  return (
    <main className="promotions-page" id="contenido">
      <EmberTrail />
      <section className="promotions-hero" aria-labelledby="promotions-title">
        <picture className="promotions-hero-background">
          <source media="(max-width: 650px)" srcSet="/images/promotions/hero-mobile-v2.webp" />
          <img
            src="/images/promotions/hero-desktop-v3.webp"
            alt="Pollo a la brasa y papas en una edición de Halloween"
            width="1920"
            height="360"
            fetchPriority="high"
          />
        </picture>
        <div className="promotions-hero-copy">
          <h1 id="promotions-title">
            <span className="sr-only">Promociones que dan susto</span>
            <img src="/images/promotions/title.webp" alt="" width="1200" height="420" />
          </h1>
          <p>Sabores de temporada, por tiempo limitado</p>
        </div>
        <p className="promotions-hero-note">
          El buen
          <br />
          pollo{' '}
          <span>
            también
            <br />
            da miedo…
          </span>
          <br />
          de lo rico
          <br />
          que es
        </p>
      </section>

      <div className="promotions-container">
        <label className="carta-mobile-search" id="carta-search">
          <Icon name="search" />
          <input
            type="search"
            aria-label="Buscar promociones"
            placeholder="Buscar promociones…"
            value={busqueda}
            onChange={event => {
              setBusqueda(event.target.value);
              setLimit(6);
            }}
          />
        </label>

        <div className="carta-toolbar">
          <CategoriasCarta
            categoriaSeleccionada={categoria}
            alSeleccionar={val => {
              setCategoria(val);
              setLimit(6);
            }}
            categorias={[]}
            label="Categorías de promociones"
            tabs={promotionCategories.map(item => ({
              id: item.id,
              name: item.label,
              icon: item.icon,
              image: `/images/carta/categories/${
                item.id === 'bebidas'
                  ? 'bebidas'
                  : item.id === 'acompanamientos'
                  ? 'acompanamientos'
                  : item.id === 'combos' || item.id === 'familiares'
                  ? 'combos'
                  : 'pollo'
              }.webp`,
            }))}
          />
          <OrdenamientoCarta
            value={labelOrder}
            onChange={value => setLabelOrder(value)}
            label="Ordenar promociones por etiqueta"
            options={promotionLabels.map(label => ({
              id: label.id as any,
              name:
                label.name === 'EDICIÓN HALLOWEEN'
                  ? 'Edición Halloween'
                  : label.name === 'LA MÁS PEDIDA'
                  ? 'La más pedida'
                  : 'Solo por temporada',
              icon: label.icon,
              description: 'Mostrar primero esta etiqueta',
            }))}
          />
        </div>

        <section aria-label="Ofertas de temporada">
          <p className="sr-only" role="status">
            {filtradas.length} promociones disponibles
          </p>

          {filtradas.length > 0 ? (
            <>
              <div className="promo-offer-grid">
                {filtradas.slice(0, limit).map(promotion => (
                  <TarjetaPromocion
                    key={promotion.id}
                    promocion={promotion}
                    alAgregar={(id, count) => agregar(id, count)}
                  />
                ))}
              </div>
              {limit < filtradas.length && (
                <button
                  type="button"
                  className="carta-load-more"
                  onClick={() => setLimit(prev => prev + 6)}
                >
                  Ver más productos <Icon name="arrow" />
                </button>
              )}
            </>
          ) : !cargando ? (
            <div className="carta-no-results">
              <Icon name="search" />
              <h2>No encontramos esa promoción</h2>
              <p>Prueba otro nombre o cambia la categoría.</p>
              <button
                type="button"
                onClick={() => {
                  setBusqueda('');
                  setCategoria('todas');
                  setLimit(6);
                }}
              >
                Ver todas las promociones
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
