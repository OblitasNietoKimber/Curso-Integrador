import { Icono, type NombreIcono } from './Icono';
import { usarCarrito } from '../hooks/usarCarrito';

interface EnlaceNavegacion {
  nombre: string;
  ruta: string;
  icono: NombreIcono;
}

const enlaces: EnlaceNavegacion[] = [
  { nombre: 'Inicio', ruta: '/', icono: 'home' },
  { nombre: 'Carta', ruta: '/carta', icono: 'cutlery' },
  { nombre: 'Promociones', ruta: '/promociones', icono: 'tag' },
  { nombre: 'Carrito', ruta: '/carrito', icono: 'cart' },
];

export function NavegacionInferior({
  activa,
  alNavegar,
}: {
  activa: string;
  alNavegar: (ruta: string) => void;
}) {
  const { cantidadTotal } = usarCarrito();

  return (
    <nav className="carta-bottom-nav" aria-label="Navegación inferior">
      {enlaces.map(item => (
        <button
          key={item.nombre}
          type="button"
          aria-current={item.nombre === activa ? 'page' : undefined}
          className={item.nombre === activa ? 'active' : ''}
          onClick={() => alNavegar(item.ruta)}
        >
          <div className="nav-icon-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
            <Icono name={item.icono} />
            {item.nombre === 'Carrito' && cantidadTotal > 0 && (
              <span className="bottom-cart-badge">{cantidadTotal}</span>
            )}
          </div>
          <span>{item.nombre}</span>
        </button>
      ))}
    </nav>
  );
}
