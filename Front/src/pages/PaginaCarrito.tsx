import { Icono } from '../components/Icono';
import { ListaArticulosCarrito } from '../components/carrito/ListaArticulosCarrito';
import { ResumenTotalesCarrito } from '../components/carrito/ResumenTotalesCarrito';
import { usarCarrito } from '../hooks/usarCarrito';
import '../styles/carrito.css';

interface PropiedadesPaginaCarrito {
  alNavegar: (ruta: string) => void;
}

export function PaginaCarrito({ alNavegar }: PropiedadesPaginaCarrito) {
  const {
    items,
    cantidadTotal,
    total,
    cargando,
    actualizarCantidad,
    eliminar,
    vaciar,
    mensajeNotificacion,
    limpiarMensaje,
  } = usarCarrito();

  return (
    <main id="contenido" className="carrito-pagina">
      <div className="carrito-contenedor">
        {/* Notificación flotante */}
        {mensajeNotificacion && (
          <aside
            className="carta-toast"
            role="status"
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '20px',
              backgroundColor: '#2e7d32',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Icono name="check" />
            <span>{mensajeNotificacion}</span>
            <button
              type="button"
              onClick={limpiarMensaje}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                marginLeft: '8px',
              }}
            >
              ✕
            </button>
          </aside>
        )}

        <div className="carrito-encabezado">
          <h1>Carrito de compras</h1>
          <p>Revisa y ajusta los productos que deseas ordenar antes de continuar.</p>
        </div>

        {items.length > 0 ? (
          <div className="carrito-cuadricula">
            <ListaArticulosCarrito
              items={items}
              alIncrementar={(id, cant) => actualizarCantidad(id, cant + 1)}
              alDisminuir={(id, cant) => actualizarCantidad(id, cant - 1)}
              alEliminar={id => eliminar(id)}
              alVaciar={vaciar}
            />

            <ResumenTotalesCarrito
              cantidadTotal={cantidadTotal}
              total={total}
              alContinuarComprando={() => alNavegar('/carta')}
            />
          </div>
        ) : (
          <section className="carrito-panel carrito-vacio" aria-label="Carrito vacío">
            <Icono name="cart" />
            <h3>Tu carrito está esperando algo delicioso</h3>
            <p>Descubre nuestros pollos a la brasa, combos, parrillas y complementos.</p>
            <button
              type="button"
              className="boton-principal-cta"
              onClick={() => alNavegar('/carta')}
            >
              <Icono name="cutlery" /> Ver la carta <Icono name="arrow" />
            </button>
          </section>
        )}

        {cargando && (
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Sincronizando cambios con el servidor…
          </p>
        )}
      </div>
    </main>
  );
}
