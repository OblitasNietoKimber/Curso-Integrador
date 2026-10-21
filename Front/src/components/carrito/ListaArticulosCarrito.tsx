import { Icono } from '../Icono';
import type { ItemCarrito } from '../../tipos';

interface PropiedadesListaArticulosCarrito {
  items: ItemCarrito[];
  alIncrementar: (productoId: string, cantidadActual: number) => void;
  alDisminuir: (productoId: string, cantidadActual: number) => void;
  alEliminar: (productoId: string) => void;
  alVaciar: () => void;
}

export function ListaArticulosCarrito({
  items,
  alIncrementar,
  alDisminuir,
  alEliminar,
  alVaciar,
}: PropiedadesListaArticulosCarrito) {
  return (
    <section className="carrito-panel" aria-labelledby="articulos-carrito-titulo">
      <div className="carrito-panel-cabecera">
        <h2 id="articulos-carrito-titulo">
          <Icono name="cart" /> Artículos en tu carrito ({items.reduce((s, i) => s + i.cantidad, 0)})
        </h2>
        {items.length > 0 && (
          <button
            type="button"
            className="boton-texto-vaciar"
            onClick={alVaciar}
          >
            <Icono name="trash" /> Vaciar carrito
          </button>
        )}
      </div>

      <ul className="carrito-lista-articulos">
        {items.map(item => (
          <li key={item.productoId} className="carrito-item">
            <img
              src={item.imagen}
              alt={item.nombre}
              className="carrito-item-imagen"
              width="90"
              height="70"
            />

            <div className="carrito-item-detalles">
              <h3>{item.nombre}</h3>
              {item.descripcion && <p>{item.descripcion}</p>}
              <span className="carrito-item-precio-unitario">
                Precio unitario: S/ {item.precioUnitario.toFixed(2)}
              </span>
            </div>

            {/* Controles de Cantidad */}
            <div
              className="carrito-control-cantidad"
              role="group"
              aria-label={`Cantidad de ${item.nombre}`}
            >
              <button
                type="button"
                disabled={item.cantidad <= 1}
                aria-label={`Quitar uno de ${item.nombre}`}
                onClick={() => alDisminuir(item.productoId, item.cantidad)}
              >
                −
              </button>
              <output>{item.cantidad}</output>
              <button
                type="button"
                disabled={item.cantidad >= 99}
                aria-label={`Agregar uno más de ${item.nombre}`}
                onClick={() => alIncrementar(item.productoId, item.cantidad)}
              >
                +
              </button>
            </div>

            {/* Subtotal por Producto y Botón Eliminar */}
            <div className="carrito-item-subtotal">
              <small>Subtotal</small>
              <strong>S/ {item.subtotal.toFixed(2)}</strong>
              <button
                type="button"
                className="boton-eliminar-item"
                aria-label={`Eliminar ${item.nombre}`}
                onClick={() => alEliminar(item.productoId)}
              >
                <Icono name="trash" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
