import { useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import { soles } from '../../utils/formato';
import type { Producto } from '../../tipos';

interface PropiedadesDetalleProductoModal {
  producto: Producto | null;
  alCerrar: () => void;
  alAgregar: (productoId: string) => void;
}

export function DetalleProductoModal({
  producto,
  alCerrar,
  alAgregar,
}: PropiedadesDetalleProductoModal) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (producto) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [producto]);

  return (
    <dialog
      ref={ref}
      className="carta-dialog product-detail"
      aria-labelledby="product-detail-title"
      onClose={alCerrar}
    >
      <button
        type="button"
        className="dialog-close"
        aria-label="Cerrar detalle"
        onClick={alCerrar}
      >
        <Icon name="close" />
      </button>
      {producto && (
        <>
          <img
            src={producto.imagen}
            alt={producto.descripcion}
            width="640"
            height="400"
          />
          <div>
            <h2 id="product-detail-title">{producto.nombre}</h2>
            <p>{producto.descripcion}</p>
            <strong>{soles(producto.precio)}</strong>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                alAgregar(producto.id);
                alCerrar();
              }}
            >
              <Icon name="cart" />
              Agregar a mi pedido
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
