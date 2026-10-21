import { Icono } from '../Icono';

interface PropiedadesResumenTotalesCarrito {
  cantidadTotal: number;
  total: number;
  alContinuarComprando: () => void;
}

export function ResumenTotalesCarrito({
  cantidadTotal,
  total,
  alContinuarComprando,
}: PropiedadesResumenTotalesCarrito) {
  return (
    <aside className="carrito-panel carrito-resumen" aria-labelledby="resumen-pedido-titulo">
      <div className="carrito-panel-cabecera">
        <h2 id="resumen-pedido-titulo">
          <Icono name="receipt" /> Resumen de compra
        </h2>
      </div>

      <div className="resumen-filas">
        <div className="resumen-fila">
          <span>Cantidad de artículos:</span>
          <strong>{cantidadTotal}</strong>
        </div>

        <div className="resumen-fila">
          <span>Subtotal estimado:</span>
          <strong>S/ {total.toFixed(2)}</strong>
        </div>

        <div className="resumen-fila-total">
          <span>Total general:</span>
          <strong>S/ {total.toFixed(2)}</strong>
        </div>
      </div>

      <button
        type="button"
        className="boton-secundario-cta"
        onClick={alContinuarComprando}
      >
        <Icono name="arrow" style={{ transform: 'rotate(180deg)' }} /> Seguir viendo la carta
      </button>

      <div className="carrito-resumen-aviso">
        <Icono name="shield" />
        <span>Precios oficiales sincronizados y calculados por el servidor.</span>
      </div>
    </aside>
  );
}
