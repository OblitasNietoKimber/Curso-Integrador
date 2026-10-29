import { apiRequest } from '../../services/api';
import type { Estado, Pago } from '../../services/cajaApi';
export const cargarVentas = () => apiRequest<Estado>('/caja');
export const diaLima = (value: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
export function sumar(pagos: Pago[]) { return pagos.reduce((s, p) => s + Number(p.monto), 0); }
export function agrupar<T>(rows: T[], key: (row: T) => string, value: (row: T) => number) { const map = new Map<string, number>(); rows.forEach(r => map.set(key(r), (map.get(key(r)) || 0) + value(r))); return [...map].map(([label, value]) => ({ label, value })); }
