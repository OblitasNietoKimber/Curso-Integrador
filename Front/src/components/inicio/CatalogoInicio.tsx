import { Icon } from '../Icon';
import { usarCarrito } from '../../hooks/usarCarrito';

const specialties = [
  { key: 'pollo', title: 'Pollo a la brasa', description: 'El clásico que nos identifica', categoryId: 'pollo' },
  { key: 'combos', title: 'Combos', description: 'La mejor combinación de sabor', categoryId: 'combos' },
  { key: 'parrillas', title: 'Parrillas', description: 'Carnes con el auténtico sabor a la leña', categoryId: 'parrillas' },
  { key: 'bebidas', title: 'Bebidas y acompañamientos', description: 'El complemento perfecto', categoryId: 'bebidas' },
];

const promotions = [
  { key: 'familiar', label: 'Promo familiar', title: 'Pollo a la brasa', items: ['papas grandes', 'ensalada familiar', 'Inca Kola 1.5 L'], price: '69', id: 'promo-terror-familiar' },
  { key: 'parrillera', label: 'Promo parrillera', title: 'Parrilla familiar', items: ['papas + ensalada', 'Inca Kola 1.5 L'], price: '89', id: 'promo-parrilla-embrujada' },
  { key: 'duo', label: 'Dúo de pollos', title: '2 pollos a la brasa', items: ['papas grandes', '2 Inca Kolas 1.5 L'], price: '119', id: 'promo-terror-duo' },
];

function FoodImage({ name, alt }: { name: string; alt: string }) {
  return (
    <img
      src={`/images/home/${name}-1080.webp`}
      srcSet={`/images/home/${name}-640.webp 640w, /images/home/${name}-1080.webp 1080w`}
      sizes="(max-width: 650px) 94vw, (max-width: 1100px) 46vw, 31vw"
      alt={alt}
      width="1080"
      height="432"
      loading="lazy"
      decoding="async"
    />
  );
}

export function CatalogoInicio({ alNavegar }: { alNavegar: (ruta: string) => void }) {
  const { agregar } = usarCarrito();

  return (
    <>
      <section id="especialidades" className="home-specialties home-section">
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">Lo mejor de nuestra cocina</p>
              <h2>Nuestras especialidades</h2>
            </div>
            <button className="home-more" type="button" onClick={() => alNavegar('/carta')}>
              Ver toda la carta
              <Icon name="arrow" />
            </button>
          </div>
          <div className="specialty-grid">
            {specialties.map(item => (
              <button
                key={item.key}
                type="button"
                className="specialty-card"
                onClick={() => alNavegar(`/carta?categoria=${item.categoryId}`)}
              >
                <FoodImage name={item.key} alt="" />
                <div className="specialty-copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="round-arrow">
                    <Icon name="arrow" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="promociones" className="home-promotions home-section">
        <div className="home-container">
          <div className="home-section-heading">
            <h2>
              Promociones que <span className="home-script">encienden el antojo</span>
            </h2>
            <button className="home-more" type="button" onClick={() => alNavegar('/promociones')}>
              Ver todas las promociones
              <Icon name="arrow" />
            </button>
          </div>
          <div className="promotion-grid">
            {promotions.map(item => (
              <div
                className={`promotion-card promotion-${item.key}`}
                key={item.key}
                role="button"
                tabIndex={0}
                onClick={e => {
                  if (!(e.target as HTMLElement).closest('.promotion-add-button')) {
                    alNavegar('/promociones');
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    alNavegar('/promociones');
                  }
                }}
                aria-label={`${item.label}: ${item.title}, ${item.items.join(', ')}, S/ ${item.price}.90`}
              >
                <FoodImage name={item.key} alt="" />
                <div className="promotion-copy">
                  <span className="promotion-label">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>
                    {item.items.map(line => (
                      <span key={line}>+ {line}</span>
                    ))}
                  </p>
                  <div className="promotion-price">
                    <span>S/</span> {item.price}
                    <sup>.90</sup>
                  </div>
                </div>
                <button
                  type="button"
                  className="promotion-add-button"
                  onClick={e => {
                    e.stopPropagation();
                    agregar(item.id, 1);
                  }}
                  aria-label={`Añadir ${item.title} al carrito`}
                >
                  <Icon name="cart" />
                  <span>
                    Añadir<span className="promotion-add-extra"> al carrito</span>
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
