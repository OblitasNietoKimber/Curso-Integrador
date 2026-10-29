import { apiRequest } from './api';
import type { Pedido } from './cajaApi';
import type { Order, Status } from './operationsStore';
import { ServicioProductos } from './ServicioProductos';
import { ServicioPromociones } from './ServicioPromociones';

type PedidoCocina = Pedido & { items: (Pedido['items'][number] & { imagen?: string })[] };
export function adaptarPedido(p: PedidoCocina): Order {
  return {
    id: p.id, customerId: '', customer: p.cliente, phone: p.telefono || '', email: '',
    address: p.direccion || '', channel: p.canal as Order['channel'], table: Number(p.mesa) || null,
    notes: p.notas || '', status: p.estado || 'Recibido', created: p.creado || '',
    accepted: p.aceptado || undefined, ready: p.listo || undefined, delivered: p.entregado || undefined,
    paid: p.pagado, discount: 0, shipping: p.envio || 0, method: '', history: [
      { status: 'Recibido', date: p.creado || '' },
      ...(p.aceptado ? [{ status: 'En preparación', date: p.aceptado }] : []),
      ...(p.listo ? [{ status: 'Listo', date: p.listo }] : []),
      ...(p.entregado ? [{ status: 'Entregado', date: p.entregado }] : []),
    ],
    items: p.items.map(i => ({ count: i.cantidad, product: {
      id: i.productoId, name: i.producto, price: i.precio, image: i.imagen || '',
      description: '', category: '', size: '', popular: 0, isNew: false, promo: false,
    } })),
  };
}
export async function cargarCocina() {
  const pedidos = await apiRequest<PedidoCocina[]>('/cocina');
  if (pedidos.some(p => p.items.some(i => !i.imagen))) {
    const catalogos = await Promise.allSettled([ServicioProductos.obtenerTodos(), ServicioPromociones.obtenerTodas()]);
    const imagenes = new Map<string, string>();
    for (const catalogo of catalogos) if (catalogo.status === 'fulfilled')
      for (const producto of catalogo.value) imagenes.set(producto.id, producto.imagen);
    for (const pedido of pedidos) for (const item of pedido.items)
      if (!item.imagen) item.imagen = imagenes.get(item.productoId);
  }
  return pedidos.map(adaptarPedido);
}
export async function cambiarEstado(id: string, esperado: Status, estado: Status) {
  return adaptarPedido(await apiRequest<PedidoCocina>('/cocina/pedidos/' + encodeURIComponent(id) + '/estado', {
    method: 'POST', body: JSON.stringify({ esperado, estado }),
  }));
}
