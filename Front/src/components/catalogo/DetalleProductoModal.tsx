import { useState } from 'react';
import { Icono } from '../Icono';
import type { Producto } from '../../tipos';

interface PropiedadesDetalleProductoModal {
  producto: Producto | null;
  alCerrar: () => void;
  alAgregar: (productoId: string, cantidad: number) => void;
}

export function DetalleProductoModal({
  producto,
  alCerrar,
  alAgregar,
}: PropiedadesDetalleProductoModal) {
  const [cantidad, setCantidad] = useState(1);

  if (!producto) return null;

  function agregarAlCarrito() {
    if (!producto) return;
    alAgregar(producto.id, cantidad);
    alCerrar();
  }

  return (
    <div
      className="carta-dialog-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) alCerrar();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-titulo"
    >
      <div className="carta-dialog">
        <button
          type="button"
          className="carta-dialog-close"
          aria-label="Cerrar ventana"
          onClick={alCerrar}
        >
          <Icono name="close" />
        </button>

        <div className="carta-dialog-media">
          <img src={producto.imagen} alt={producto.nombre} width="600" height="400" />
        </div>

        <div className="carta-dialog-content">
          <span className="carta-dialog-category">
            {producto.categoriaNombre || 'Especialidad'}
          </span>
          <h2 id="detalle-titulo">{producto.nombre}</h2>
          <p className="carta-dialog-description">{producto.descripcion}</p>

          <div className="carta-dialog-info">
            <div className="carta-dialog-price">
              <small>Precio:</small>
              <strong>S/ {producto.precio.toFixed(2)}</strong>
            </div>

            <div className="carta-dialog-quantity">
              <small>Cantidad:</small>
              <div className="checkout-quantity">
                <button
                  type="button"
                  disabled={cantidad <= 1}
                  onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  aria-label="Disminuir"
                >
                  −
                </button>
                <output>{cantidad}</output>
                <button
                  type="button"
                  disabled={cantidad >= 99}
                  onClick={() => setCantidad(c => Math.min(99, c + 1))}
                  aria-label="Aumentar"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="carta-dialog-subtotal">
            <span>Subtotal:</span>
            <strong>S/ {(producto.precio * cantidad).toFixed(2)}</strong>
          </div>

          <button
            type="button"
            className="home-button"
            style={{ width: '100%', marginTop: '1.25rem' }}
            onClick={agregarAlCarrito}
          >
            <Icono name="cart" /> Agregar {cantidad} al pedido
          </button>
        </div>
      </div>
    </div>
  );
}
