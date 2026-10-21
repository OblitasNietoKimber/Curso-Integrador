import { peticionHttp } from './clienteApi';
import type { Producto, TipoOrdenamiento } from '../tipos';

export interface ParametrosFiltroProducto {
  categoria?: string;
  tamano?: string;
  buscar?: string;
  orden?: TipoOrdenamiento | string;
}

export const ServicioProductos = {
  async obtenerTodos(filtros?: ParametrosFiltroProducto): Promise<Producto[]> {
    const parametros = new URLSearchParams();
    if (filtros?.categoria && filtros.categoria !== 'todos') {
      parametros.set('categoria', filtros.categoria);
    }
    if (filtros?.tamano && filtros.tamano !== 'todos') {
      parametros.set('tamano', filtros.tamano);
    }
    if (filtros?.buscar && filtros.buscar.trim()) {
      parametros.set('buscar', filtros.buscar.trim());
    }
    if (filtros?.orden) {
      parametros.set('orden', filtros.orden);
    }

    const consulta = parametros.toString();
    return peticionHttp<Producto[]>(`/productos${consulta ? `?${consulta}` : ''}`);
  },

  async obtenerDestacados(): Promise<Producto[]> {
    return peticionHttp<Producto[]>('/productos/destacados');
  },

  async obtenerPorId(id: string): Promise<Producto> {
    return peticionHttp<Producto>(`/productos/${encodeURIComponent(id)}`);
  },
};
