import { Icono, type NombreIcono } from '../Icono';
import type { Categoria } from '../../tipos';

interface PropiedadesCategoriasCarta {
  categoriaSeleccionada: string;
  alSeleccionar: (categoriaId: string) => void;
  categorias: Categoria[];
}

export function CategoriasCarta({
  categoriaSeleccionada,
  alSeleccionar,
  categorias,
}: PropiedadesCategoriasCarta) {
  return (
    <nav className="carta-category-nav" aria-label="Categorías de la carta">
      <div className="carta-category-list">
        <button
          type="button"
          className={`carta-category-item ${categoriaSeleccionada === 'todos' ? 'active' : ''}`}
          aria-pressed={categoriaSeleccionada === 'todos'}
          onClick={() => alSeleccionar('todos')}
        >
          <div className="carta-category-icon">
            <Icono name="grid" />
          </div>
          <span>Todos los platos</span>
        </button>

        {categorias.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`carta-category-item ${categoriaSeleccionada === cat.id ? 'active' : ''}`}
            aria-pressed={categoriaSeleccionada === cat.id}
            onClick={() => alSeleccionar(cat.id)}
          >
            <div className="carta-category-icon">
              <Icono name={(cat.icono as NombreIcono) || 'cutlery'} />
            </div>
            <span>{cat.nombre}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
