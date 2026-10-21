import { Icon } from '../Icon';
import { FavoriteButton } from './FavoriteButton';
import { soles } from '../../utils/formato';
import type { Producto } from '../../tipos';

interface PropiedadesTarjetaProducto {
  producto: Producto;
  favorito?: boolean;
  alFavorito?: () => void;
  alAgregar: (id: string) => void;
  alVerDetalle: (producto: Producto) => void;
}

export function TarjetaProducto({
  producto,
  favorito = false,
  alFavorito = () => {},
  alAgregar,
  alVerDetalle,
}: PropiedadesTarjetaProducto) {
  return (
    <article className="product-card">
      <svg className="product-border-trace" aria-hidden="true" focusable="false">
        <rect x="1" y="1" rx="11" pathLength="100" />
      </svg>
      <div
        className={`product-photo${
          producto.categoriaId === 'bebidas' ? ' product-photo-beverage' : ''
        }`}
      >
        <button
          type="button"
          className="product-open"
          onClick={() => alVerDetalle(producto)}
          aria-label={`Ver ${producto.nombre}`}
        >
          {producto.categoriaId === 'bebidas' && (
            <img
              className="beverage-backdrop"
              src={producto.imagen}
              alt=""
              aria-hidden="true"
              width="640"
              height="480"
              loading="lazy"
              decoding="async"
            />
          )}
          <img
            className="product-image"
            src={producto.imagen}
            alt={producto.descripcion}
            width="640"
            height="480"
            loading="lazy"
            decoding="async"
          />
        </button>
        <FavoriteButton
          selected={favorito}
          productName={producto.nombre}
          onToggle={alFavorito}
        />
      </div>
      <div className="product-info">
        <button
          className="product-name"
          type="button"
          onClick={() => alVerDetalle(producto)}
        >
          <h3>{producto.nombre}</h3>
        </button>
        <p>{producto.descripcion}</p>
        <div className="product-purchase">
          <strong>{soles(producto.precio)}</strong>
          <button
            type="button"
            className="product-add"
            aria-label={`Agregar ${producto.nombre}`}
            onClick={() => alAgregar(producto.id)}
          >
            <Icon name="cart" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </article>
  );
}
