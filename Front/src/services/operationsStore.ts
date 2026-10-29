import { useSyncExternalStore } from "react";
import { apiRequest } from "./api";
import { ServicioProductos } from "./ServicioProductos";
import type { Estado, NuevaVenta } from "./cajaApi";
export type Product = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  size: string;
  popular: number;
  isNew: boolean;
  promo: boolean;
  image: string;
};
export type MenuProduct = Product & {
  active?: boolean;
  stock?: number;
  sku?: string;
  branch?: string;
  preparationMinutes?: number;
  ingredients?: string[];
  observations?: string;
  gallery?: string[];
  channels?: string[];
  updatedAt?: string;
};
export type Status =
  | "Recibido"
  | "En preparación"
  | "Listo"
  | "En camino"
  | "Entregado"
  | "Cancelado";
export type Channel = "Salón" | "Delivery" | "Recojo";
export type Line = { product: Product; count: number };
export type Order = {
  id: string;
  customerId: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  deliveryEstimate?: { distanceKm: number; minutes: number; courier: string };
  channel: Channel;
  table: number | null;
  items: Line[];
  notes: string;
  status: Status;
  created: string;
  accepted?: string;
  ready?: string;
  delivered?: string;
  discount: number;
  shipping: number;
  method: string;
  couponCode?: string;
  paid: boolean;
  history: { status: string; date: string }[];
  draft?: boolean;
};
export const listoParaCobrar = (order: Order) =>
  !order.paid && !order.draft && ['Listo', 'En camino', 'Entregado'].includes(order.status);
export type TableState = {
  id: number;
  zone: string;
  seats: number;
  status: "Libre" | "Ocupada" | "Reservada" | "Solicita cuenta";
  notes: string;
};
export type Payment = {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  received: number;
  change: number;
  date: string;
  refunded: boolean;
  shiftId: string;
};
export type Voucher = {
  anulado?: boolean;
  id: string;
  orderId: string;
  type: string;
  customer: string;
  document: string;
  date: string;
  total: number;
};
export type Shift = {
  id: string;
  user: string;
  opened: string;
  closed?: string;
  initial: number;
  counted?: number;
  notes: string;
  withdrawals: number;
  difference?: number;
};
export type Supply = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min: number;
  unit: string;
  cost: number;
  updatedAt?: string;
};
export type Offer = {
  id: string;
  name: string;
  type: string;
  productId: string;
  percent: number;
  code: string;
  start: string;
  end: string;
  active: boolean;
  used: number;
  limit: number;
};
export type Movement = {
  id: string;
  supplyId: string;
  name: string;
  amount: number;
  date: string;
  note: string;
};
export type Supplier = {
  id: string;
  name: string;
  phone: string;
  email: string;
};
export type Settings = {
  description?: string;
  city?: string;
  postalCode?: string;
  ruc?: string;
  website?: string;
  openingTime?: string;
  closingTime?: string;
  ownDelivery?: boolean;
  tableCount?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  open: boolean;
  tax: number;
  methods: string[];
  target: number;
  yapeQr: string;
  plinQr: string;
  bank: string;
};
export type OperationsState = {
  products: MenuProduct[];
  orders: Order[];
  tables: TableState[];
  payments: Payment[];
  vouchers: Voucher[];
  shifts: Shift[];
  supplies: Supply[];
  movements: Movement[];
  offers: Offer[];
  suppliers: Supplier[];
  settings: Settings;
};

export const paymentMethods = [
  "Efectivo",
  "Yape",
  "Plin",
  "Tarjeta",
  "Transferencia",
];
const listeners = new Set<() => void>();
const settings: Settings = {
  name: "Leñas y Sabores",
  address: "",
  phone: "",
  email: "",
  hours: "12 m. – 11 p. m.",
  open: true,
  tax: 0,
  methods: paymentMethods,
  target: 20,
  yapeQr: "",
  plinQr: "",
  bank: "",
};
let state: OperationsState = {
  products: [],
  orders: [],
  tables: [],
  payments: [],
  vouchers: [],
  shifts: [],
  supplies: [],
  movements: [],
  offers: [],
  suppliers: [],
  settings,
};
export const money = (n: number) => "S/ " + n.toFixed(2);
export const orderTotal = (o: Order) =>
  Math.round(
    (o.items.reduce(
      (s, i) => s + Math.round(i.product.price * 100) * i.count,
      0,
    ) /
      100 -
      o.discount +
      o.shipping) *
      100,
  ) / 100;
export const minutes = (date: string) =>
  Math.max(0, Math.floor((Date.now() - Date.parse(date)) / 60000));
export const expectedCash = (shift: Shift) =>
  Math.round(
    (shift.initial +
      state.payments
        .filter(
          (p) =>
            p.shiftId === shift.id && p.method === "Efectivo" && !p.refunded,
        )
        .reduce((s, p) => s + p.amount, 0) -
      shift.withdrawals) *
      100,
  ) / 100;
export function useOperations() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => state,
  );
}
export async function loadCaja() {
  const [data, products] = await Promise.all([
    apiRequest<Estado & { configuracion?: Partial<Settings> }>("/caja"),
    ServicioProductos.obtenerTodos(),
  ]);
  const mapped = products.map((p) => ({
    id: p.id,
    category: p.categoriaId,
    name: p.nombre,
    description: p.descripcion,
    price: p.precio,
    size: p.tamano,
    popular: p.popularidad,
    isNew: p.esNuevo,
    promo: p.esPromocion,
    image: p.imagen,
    stock: p.stock,
    active: true,
  }));
  state = {
    ...state,
    products: mapped,
    settings: { ...settings, ...data.configuracion },
    orders: data.pedidos.map((p) => ({
      id: p.id,
      customerId: "",
      customer: p.cliente,
      phone: "",
      email: "",
      address: p.direccion || "",
      channel: p.canal as Channel,
      table: p.mesa ? Number(p.mesa) || null : null,
      items: p.items.map((i) => ({
        count: i.cantidad,
        product: {
          ...(mapped.find((p) => p.id === i.productoId) || {
            id: i.productoId,
            category: "",
            description: "",
            size: "",
            popular: 0,
            isNew: false,
            promo: false,
            image: "",
          }),
          name: i.producto,
          price: i.precio,
        },
      })),
      notes: p.notas || "",
      status: p.estado || "Recibido",
      accepted: p.aceptado || undefined,
      ready: p.listo || undefined,
      delivered: p.entregado || undefined,
      created: p.creado || "",
      discount: 0,
      shipping: p.envio || 0,
      method:
        data.pagos.find((g) => g.pedidoId === p.id && !g.reembolsado)?.metodo ||
        "",
      paid: p.pagado,
      history: [],
    })),
    payments: data.pagos.map((p) => ({
      id: String(p.id),
      orderId: p.pedidoId,
      amount: p.monto,
      method: p.metodo,
      received: p.recibido,
      change: p.vuelto,
      date: p.fecha,
      refunded: p.reembolsado,
      shiftId: String(p.turnoId),
    })),
    vouchers: data.comprobantes.map((c) => ({
      id: c.numero,
      orderId: c.pedidoId,
      type: c.tipo,
      customer: c.cliente,
      document: c.documento,
      date: c.fecha,
      total: c.total,
      anulado: c.anulado,
    })),
    shifts: data.turnos.map((t) => ({
      id: String(t.id),
      user: t.cajero,
      opened: t.apertura,
      closed: t.cierre || undefined,
      initial: t.inicial,
      counted: t.contado ?? undefined,
      notes: t.notas,
      withdrawals: 0,
      difference: t.diferencia ?? undefined,
    })),
  };
  listeners.forEach((l) => l());
}
async function mutate(path: string, body: unknown) {
  await apiRequest("/caja" + path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  try {
    await loadCaja();
  } catch {
    throw new Error(
      "La operación se registró, pero no se pudo actualizar la vista. Actualiza antes de reintentar.",
    );
  }
}
export async function openShift(initial: number, notes: string) {
  await mutate("/apertura", { monto: initial, notas: notes });
}
export async function closeShift(counted: number, notes: string) {
  await mutate("/cierre", { monto: counted, notas: notes });
}
export async function processPayment(
  orderId: string,
  method: string,
  received: number,
) {
  await mutate("/cobros", {
    pedidoId: orderId,
    metodo: method,
    recibido: received,
    referencia: "",
  });
}
export async function refundPayment(id: string, motivo: string) {
  await mutate("/pagos/" + encodeURIComponent(id) + "/reembolso", { motivo });
}
export async function issueVoucher(
  orderId: string,
  type: string,
  customer: string,
  document: string,
) {
  const pago = state.payments.find((p) => p.orderId === orderId && !p.refunded);
  if (!pago) throw new Error("Selecciona un pedido pagado.");
  await mutate("/comprobantes", {
    pagoId: Number(pago.id),
    tipo: type,
    cliente: customer || state.orders.find((o) => o.id === orderId)?.customer,
    documento: document,
  });
}
export async function createCajaOrder(venta: NuevaVenta) {
  await mutate("/pedidos", venta);
}
