export interface Categoria {
  id: string;
  nombre: string;
  icono?: string;
  orden?: number;
}

export interface Producto {
  id: string;
  categoriaId: string;
  categoriaNombre?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tamano: 'individual' | 'compartir' | 'familiar' | string;
  popularidad: number;
  esNuevo: boolean;
  esPromocion: boolean;
  imagen: string;
  stock: number;
}

export interface Promocion {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioOriginal?: number;
  ahorro?: number;
  insignia?: string;
  iconoInsignia?: string;
  tonoInsignia?: 'orange' | 'red' | string;
  tamano?: string;
  filtros?: string[];
  imagen: string;
}

export interface ItemCarrito {
  id?: number;
  productoId: string;
  nombre: string;
  descripcion?: string;
  imagen: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface CarritoRespuesta {
  id: string;
  items: ItemCarrito[];
  cantidadTotal: number;
  total: number;
  fechaActualizacion?: string;
}

export type TipoOrdenamiento = 'popular' | 'precio_asc' | 'precio_desc' | 'nuevo';
