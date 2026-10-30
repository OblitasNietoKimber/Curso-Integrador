import { peticionHttp } from './clienteApi';
import type { Promocion } from '../tipos';

export interface ParametrosFiltroPromocion {
  categoria?: string;
  buscar?: string;
}

export const ServicioPromociones = {
  async obtenerTodas(filtros?: ParametrosFiltroPromocion): Promise<Promocion[]> {
    const parametros = new URLSearchParams();
    if (filtros?.categoria && filtros.categoria !== 'todas') {
      parametros.set('categoria', filtros.categoria);
    }
    if (filtros?.buscar && filtros.buscar.trim()) {
      parametros.set('buscar', filtros.buscar.trim());
    }

    const consulta = parametros.toString();
    return peticionHttp<Promocion[]>(`/promociones${consulta ? `?${consulta}` : ''}`);
  },

  async obtenerDestacadas(): Promise<Promocion[]> {
    return peticionHttp<Promocion[]>('/promociones/destacadas');
  },

  async obtenerPorId(id: string): Promise<Promocion> {
    return peticionHttp<Promocion>(`/promociones/${encodeURIComponent(id)}`);
  },
};
