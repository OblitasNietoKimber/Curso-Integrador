import { peticionHttp } from './clienteApi';
import type { CarritoRespuesta } from '../tipos';

export const ServicioCarrito = {
  async obtenerCarrito(carritoId?: string): Promise<CarritoRespuesta> {
    const consulta = carritoId ? `?carritoId=${encodeURIComponent(carritoId)}` : '';
    return peticionHttp<CarritoRespuesta>(`/carrito${consulta}`);
  },

  async agregarItem(productoId: string, cantidad = 1, carritoId?: string): Promise<CarritoRespuesta> {
    const consulta = carritoId ? `?carritoId=${encodeURIComponent(carritoId)}` : '';
    return peticionHttp<CarritoRespuesta>(`/carrito/items${consulta}`, {
      method: 'POST',
      body: JSON.stringify({ productoId, cantidad }),
    });
  },

  async actualizarCantidad(productoId: string, cantidad: number, carritoId?: string): Promise<CarritoRespuesta> {
    const consulta = carritoId ? `?carritoId=${encodeURIComponent(carritoId)}` : '';
    return peticionHttp<CarritoRespuesta>(`/carrito/items/${encodeURIComponent(productoId)}${consulta}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidad }),
    });
  },

  async eliminarItem(productoId: string, carritoId?: string): Promise<CarritoRespuesta> {
    const consulta = carritoId ? `?carritoId=${encodeURIComponent(carritoId)}` : '';
    return peticionHttp<CarritoRespuesta>(`/carrito/items/${encodeURIComponent(productoId)}${consulta}`, {
      method: 'DELETE',
    });
  },

  async vaciarCarrito(carritoId?: string): Promise<CarritoRespuesta> {
    const consulta = carritoId ? `?carritoId=${encodeURIComponent(carritoId)}` : '';
    return peticionHttp<CarritoRespuesta>(`/carrito${consulta}`, {
      method: 'DELETE',
    });
  },
};
