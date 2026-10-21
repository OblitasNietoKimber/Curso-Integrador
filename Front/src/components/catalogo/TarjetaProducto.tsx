import { Icono } from '../Icono';
import type { Producto } from '../../tipos';

interface PropiedadesTarjetaProducto {
  producto: Producto;
  alAgregar: (id: string) => void;
  alVerDetalle: (producto: Producto) => void;
}

export function TarjetaProducto({
  producto,
  alAgregar,
  alVerDetalle,
}: PropiedadesTarjetaProducto) {
  return (
    <article className="carta-card">
      <div
        className="carta-card-media"
        onClick={() => alVerDetalle(producto)}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={producto.imagen}
          alt={producto.nombre}
          width="400"
          height="300"
          loading="lazy"
        />
        <div className="carta-card-badges">
          {producto.esNuevo && <span className="carta-badge-new">NUEVO</span>}
          {producto.esPromocion && <span className="carta-badge-promo">PROMO</span>}
        </div>
      </div>

      <div className="carta-card-body">
        <h3
          onClick={() => alVerDetalle(producto)}
          style={{ cursor: 'pointer' }}
        >
          {producto.nombre}
        </h3>
        <p>{producto.descripcion}</p>

        <div className="carta-card-footer">
          <div className="carta-card-price">
            <small>S/</small>
            <strong>{producto.precio.toFixed(2)}</strong>
          </div>

          <button
            type="button"
            className="carta-card-button"
            aria-label={`Agregar ${producto.nombre} al pedido`}
            onClick={() => alAgregar(producto.id)}
          >
            <Icono name="cart" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </article>
  );
}
