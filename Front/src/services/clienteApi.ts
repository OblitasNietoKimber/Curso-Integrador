import { apiRequest, ApiError } from './api';
export class ErrorApi extends Error {
 constructor(message: string, public codigoEstado: number) { super(message); }
}
export async function peticionHttp<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
 const headers = new Headers(opciones.headers);
 const id = localStorage.getItem('lys-carrito-token');
 if (id && !headers.has('X-Carrito-Id')) headers.set('X-Carrito-Id', id);
 try { return await apiRequest<T>(ruta.startsWith('/') ? ruta : '/' + ruta, { ...opciones, headers }); }
 catch(error) { throw new ErrorApi(error instanceof Error ? error.message : 'No se pudo conectar con el servidor.', error instanceof ApiError ? error.status : 0); }
}
