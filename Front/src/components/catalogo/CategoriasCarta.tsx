import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from '../Icon';
import type { Categoria } from '../../tipos';

export interface TabCategoria {
  id: string;
  name: string;
  icon: IconName;
  image?: string;
}

interface PropiedadesCategoriasCarta {
  categoriaSeleccionada: string;
  alSeleccionar: (categoriaId: string) => void;
  categorias: Categoria[];
  tabs?: TabCategoria[];
  label?: string;
}

export function CategoriasCarta({
  categoriaSeleccionada,
  alSeleccionar,
  categorias,
  tabs,
  label = 'Categorías de la carta',
}: PropiedadesCategoriasCarta) {
  const track = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });

  const listaTabs: TabCategoria[] = useMemo(() => {
    if (tabs) return tabs;
    return [
      { id: 'todos', name: 'Todos', icon: 'grid' as IconName, image: '/images/carta/categories/pollo.webp' },
      ...categorias.map(cat => ({
        id: cat.id,
        name: cat.nombre,
        icon: (cat.icono as IconName) || 'chicken',
        image: `/images/carta/categories/${cat.id}.webp`,
      })),
    ];
  }, [tabs, categorias]);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () =>
      setEdges({
        overflow: element.scrollWidth > element.clientWidth + 2,
        left: element.scrollLeft > 2,
        right: element.scrollLeft + element.clientWidth < element.scrollWidth - 2,
      });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, [listaTabs]);

  function scroll(direction: number) {
    const element = track.current;
    if (element) {
      element.scrollBy({
        left: direction * element.clientWidth * 0.75,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    }
  }

  return (
    <div className="carta-category-navigation" data-overflow={edges.overflow}>
      <button
        type="button"
        className="category-scroll category-scroll-left"
        aria-label="Ver categorías anteriores"
        aria-controls="carta-categories"
        disabled={!edges.left}
        onClick={() => scroll(-1)}
      >
        <Icon name="chevron" />
      </button>

      <nav ref={track} id="carta-categories" className="carta-categories" aria-label={label}>
        {listaTabs.map(tab => (
          <button
            type="button"
            key={tab.id}
            aria-pressed={categoriaSeleccionada === tab.id}
            onClick={() => alSeleccionar(tab.id)}
          >
            <Icon name={tab.icon} />
            <img
              className="category-image"
              src={tab.image || `/images/carta/categories/${tab.id === 'todos' ? 'pollo' : tab.id}.webp`}
              alt=""
              width="80"
              height="64"
            />
            <span>{tab.name}</span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="category-scroll category-scroll-right"
        aria-label="Ver siguientes categorías"
        aria-controls="carta-categories"
        disabled={!edges.right}
        onClick={() => scroll(1)}
      >
        <Icon name="chevron" />
      </button>
    </div>
  );
}
