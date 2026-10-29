import { apiRequest } from './api';
import type { Pedido } from './cajaApi';

export type NuevoPedidoWeb = {
  solicitud: string; cliente: string; canal: 'Delivery' | 'Recojo';
  direccion: string; telefono: string; notas: string;
  items: { productoId: string; cantidad: number }[];
};
export const crearPedidoWeb = (pedido: NuevoPedidoWeb) => apiRequest<Pedido>('/pedidos', {
  method: 'POST', body: JSON.stringify(pedido),
});
export const consultarPedido = (id: string) => apiRequest<Pedido>('/pedidos/' + encodeURIComponent(id));
