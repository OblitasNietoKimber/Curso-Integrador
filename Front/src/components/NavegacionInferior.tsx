import { Icon, type IconName } from './Icon';

interface PropiedadesNavegacionInferior {
  activa: string;
  alNavegar: (ruta: string) => void;
}

const links: { name: string; icon: IconName; path: string }[] = [
  { name: 'Inicio', icon: 'home', path: '/' },
  { name: 'Carta', icon: 'cutlery', path: '/carta' },
  { name: 'Promociones', icon: 'tag', path: '/promociones' },
  { name: 'Carrito', icon: 'cart', path: '/carrito' },
];

export function NavegacionInferior({ activa, alNavegar }: PropiedadesNavegacionInferior) {
  return (
    <nav
      className="carta-bottom-nav"
      aria-label="Navegación inferior"
      style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
    >
      {links.map(item => (
        <button
          key={item.name}
          type="button"
          aria-current={item.name === activa ? 'page' : undefined}
          onClick={() => alNavegar(item.path)}
        >
          <Icon name={item.icon} />
          <span>{item.name}</span>
        </button>
      ))}
    </nav>
  );
}
