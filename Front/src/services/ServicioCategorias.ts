import { peticionHttp } from './clienteApi';
import type { Categoria } from '../tipos';

export const ServicioCategorias = {
  async obtenerTodas(): Promise<Categoria[]> {
    return peticionHttp<Categoria[]>('/categorias');
  },

  async obtenerPorId(id: string): Promise<Categoria> {
    return peticionHttp<Categoria>(`/categorias/${encodeURIComponent(id)}`);
  },
};
