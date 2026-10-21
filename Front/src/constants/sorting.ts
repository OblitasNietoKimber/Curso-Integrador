import type { IconName } from '../components/Icon';

export type SortOptionId = 'popular' | 'price' | 'new' | 'promo';

export interface SortOption {
  id: SortOptionId;
  name: string;
  icon: IconName;
  description: string;
}

export const defaultSorting: SortOption[] = [
  { id: 'popular', name: 'Más populares', icon: 'flame', description: 'Los favoritos de la casa' },
  { id: 'price', name: 'Precio', icon: 'sort', description: 'De menor a mayor' },
  { id: 'new', name: 'Nuevos', icon: 'star', description: 'Descubre las novedades' },
  { id: 'promo', name: 'Promo', icon: 'tag', description: 'Productos en promoción' },
];
