const URL_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export class ErrorApi extends Error {
  codigoEstado: number;

  constructor(mensaje: string, codigoEstado: number) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigoEstado = codigoEstado;
  }
}

export async function peticionHttp<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const urlCompleta = `${URL_BASE}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;

  const encabezados = new Headers(opciones.headers || {});
  if (!encabezados.has('Content-Type') && !(opciones.body instanceof FormData)) {
    encabezados.set('Content-Type', 'application/json');
  }

  // Token identificador de carrito anónimo en cabecera
  const carritoToken = localStorage.getItem('lys-carrito-token');
  if (carritoToken && !encabezados.has('X-Carrito-Id')) {
    encabezados.set('X-Carrito-Id', carritoToken);
  }

  try {
    const respuesta = await fetch(urlCompleta, {
      ...opciones,
      headers: encabezados,
    });

    if (!respuesta.ok) {
      let mensajeError = `Error HTTP ${respuesta.status}: ${respuesta.statusText}`;
      try {
        const datosError = await respuesta.json();
        if (datosError && datosError.message) {
          mensajeError = datosError.message;
        }
      } catch {
        /* No es JSON */
      }
      throw new ErrorApi(mensajeError, respuesta.status);
    }

    if (respuesta.status === 204) {
      return null as T;
    }

    return (await respuesta.json()) as T;
  } catch (error) {
    if (error instanceof ErrorApi) {
      throw error;
    }
    throw new ErrorApi(
      error instanceof Error ? error.message : 'Error desconocido al conectar con el servidor',
      0
    );
  }
}
