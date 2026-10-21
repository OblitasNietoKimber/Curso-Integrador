import { useState, useEffect } from 'react';
import { Icono } from '../Icono';
import { ServicioPromociones } from '../../services/ServicioPromociones';
import { usarCarrito } from '../../hooks/usarCarrito';
import type { Promocion } from '../../tipos';

interface PropiedadesCatalogoInicio {
  alNavegar: (ruta: string) => void;
}

const especialidades = [
  { clave: 'pollo', titulo: 'Pollo a la brasa', descripcion: 'El clásico que nos identifica', categoriaId: 'pollo' },
  { clave: 'combos', titulo: 'Combos familiares', descripcion: 'La mejor combinación de sabor y abundancia', categoriaId: 'combos' },
  { clave: 'parrillas', titulo: 'Parrillas al carbón', descripcion: 'Carnes con el auténtico aroma de la leña', categoriaId: 'parrillas' },
  { clave: 'bebidas', titulo: 'Bebidas y complementos', descripcion: 'El acompañamiento perfecto para tu mesa', categoriaId: 'bebidas' },
];

export function CatalogoInicio({ alNavegar }: PropiedadesCatalogoInicio) {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);
  const { agregar } = usarCarrito();

  useEffect(() => {
    let activo = true;
    ServicioPromociones.obtenerDestacadas()
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
  }, []);

  return (
    <>
      {/* Especialidades */}
      <section id="especialidades" className="home-specialties home-section">
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">Lo mejor de nuestra cocina</p>
              <h2>Nuestras especialidades</h2>
            </div>
            <button
              type="button"
              className="home-more"
              onClick={() => alNavegar('/carta')}
            >
              Ver toda la carta <Icono name="arrow" />
            </button>
          </div>

          <div className="specialty-grid">
            {especialidades.map(item => (
              <button
                key={item.clave}
                type="button"
                className="specialty-card"
                onClick={() => alNavegar(`/carta?categoria=${item.categoriaId}`)}
              >
                <img
                  src={`/images/home/${item.clave}-1080.webp`}
                  srcSet={`/images/home/${item.clave}-640.webp 640w, /images/home/${item.clave}-1080.webp 1080w`}
                  sizes="(max-width: 650px) 94vw, (max-width: 1100px) 46vw, 31vw"
                  alt={item.titulo}
                  width="1080"
                  height="432"
                  loading="lazy"
                />
                <div className="specialty-copy">
                  <h3>{item.titulo}</h3>
                  <p>{item.descripcion}</p>
                  <span className="round-arrow">
                    <Icono name="arrow" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Promociones Destacadas */}
      <section id="promociones" className="home-promotions home-section">
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <h2>
                Promociones que <span className="home-script">encienden el antojo</span>
              </h2>
            </div>
            <button
              type="button"
              className="home-more"
              onClick={() => alNavegar('/promociones')}
            >
              Ver todas las promociones <Icono name="arrow" />
            </button>
          </div>

          <div className="promotion-grid">
            {cargando ? (
              <p style={{ color: 'rgba(255,255,255,0.7)', padding: '2rem 0' }}>Cargando promociones vigentes…</p>
            ) : promociones.length > 0 ? (
              promociones.map(promo => (
                <div
                  key={promo.id}
                  className="promotion-card"
                  style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}
                >
                  <img
                    src={promo.imagen}
                    alt={promo.nombre}
                    width="1080"
                    height="432"
                    loading="lazy"
                  />
                  <div className="promotion-copy" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {promo.insignia && <span className="promotion-label">{promo.insignia}</span>}
                    <h3>{promo.nombre}</h3>
                    <p style={{ flex: 1 }}>{promo.descripcion}</p>
                    <div className="promotion-price" style={{ margin: '1rem 0' }}>
                      <span>S/</span> {promo.precio.toFixed(2)}
                    </div>
                    <button
                      type="button"
                      className="home-button"
                      style={{ width: '100%', marginTop: 'auto' }}
                      onClick={() => agregar(promo.id, 1)}
                    >
                      <Icono name="cart" /> Agregar al carrito
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>No hay promociones vigentes por el momento.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
