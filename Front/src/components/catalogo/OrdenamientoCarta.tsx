import { Icono, type NombreIcono } from '../Icono';
import type { TipoOrdenamiento } from '../../tipos';

interface PropiedadesOrdenamientoCarta {
  ordenActual: TipoOrdenamiento;
  alCambiar: (orden: TipoOrdenamiento) => void;
}

const opciones: { id: TipoOrdenamiento; etiqueta: string; icono: NombreIcono }[] = [
  { id: 'popular', etiqueta: 'Más pedidos', icono: 'star' },
  { id: 'precio_asc', etiqueta: 'Menor precio', icono: 'sort' },
  { id: 'precio_desc', etiqueta: 'Mayor precio', icono: 'sort' },
  { id: 'nuevo', etiqueta: 'Novedades', icono: 'tag' },
];

export function OrdenamientoCarta({ ordenActual, alCambiar }: PropiedadesOrdenamientoCarta) {
  return (
    <div className="carta-sorting-bar" aria-label="Ordenar productos">
      <span className="carta-sorting-label">
        <Icono name="sort" /> Ordenar por:
      </span>
      <div className="carta-sorting-options">
        {opciones.map(op => (
          <button
            key={op.id}
            type="button"
            className={`carta-sort-button ${ordenActual === op.id ? 'active' : ''}`}
            aria-pressed={ordenActual === op.id}
            onClick={() => alCambiar(op.id)}
          >
            <Icono name={op.icono} />
            <span>{op.etiqueta}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
