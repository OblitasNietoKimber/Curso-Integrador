import { apiRequest } from "./api";
export type Linea = {
  producto: string;
  productoId: string;
  cantidad: number;
  precio: number;
  imagen?: string;
};
export type Pedido = {
  id: string;
  cliente: string;
  clienteId?: string | null;
  canal: string;
  mesa: string;
  pagado: boolean;
  metodoPago?: string;
  creado?: string;
  estado?: import('./operationsStore').Status;
  aceptado?: string;
  listo?: string;
  entregado?: string;
  notas?: string;
  direccion?: string;
  telefono?: string;
  envio?: number;
  items: Linea[];
  total: number;
};
export type Turno = {
  id: number;
  cajero: string;
  apertura: string;
  cierre: string | null;
  inicial: number;
  contado: number | null;
  esperado: number | null;
  diferencia: number | null;
  notas: string;
};
export type Pago = {
  id: number;
  pedidoId: string;
  turnoId: number | null;
  metodo: string;
  monto: number;
  recibido: number;
  vuelto: number;
  fecha: string;
  reembolsado: boolean;
  referencia: string;
  motivoReembolso: string | null;
};
export type Comprobante = {
  id: number;
  pagoId: number;
  pedidoId: string;
  numero: string;
  tipo: string;
  cliente: string;
  documento: string;
  total: number;
  fecha: string;
  anulado: boolean;
};
export type Estado = {
  turnos: Turno[];
  pedidos: Pedido[];
  pagos: Pago[];
  comprobantes: Comprobante[];
};
export type NuevaVenta = {
  cliente: string;
  canal: string;
  mesa: string;
  items: { productoId: string; cantidad: number }[];
};
export const metodos = ["Efectivo", "Tarjeta", "Yape", "Plin", "Transferencia"];
export const dinero = (n: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    n,
  );
export const fecha = (s: string) =>
  new Date(s).toLocaleString("es-PE", { timeZone: "America/Lima" });
export async function solicitar(
  ruta = "",
  body?: unknown,
): Promise<Estado | undefined> {
  return apiRequest<Estado | undefined>(
    "/caja" + ruta,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) },
  );
}
