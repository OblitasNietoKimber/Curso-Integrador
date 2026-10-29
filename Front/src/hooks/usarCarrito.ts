import { useEffect, useState, useSyncExternalStore, useCallback } from 'react';
import { ServicioCarrito } from '../services/ServicioCarrito';
import type { CarritoRespuesta } from '../tipos';

const CLAVE_TOKEN_CARRITO = 'lys-carrito-token';
const CLAVE_DATOS_CARRITO = 'lys-carrito-datos';

function obtenerTokenCarrito(): string {
  let token = localStorage.getItem(CLAVE_TOKEN_CARRITO);
  if (!token) {
    token = 'car_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(CLAVE_TOKEN_CARRITO, token);
  }
  return token;
}

const estadoInicial: CarritoRespuesta = {
  id: '',
  items: [],
  cantidadTotal: 0,
  total: 0,
};

function leerCarritoLocal(): CarritoRespuesta {
  try {
    const raw = localStorage.getItem(CLAVE_DATOS_CARRITO);
    if (!raw) return { ...estadoInicial, id: obtenerTokenCarrito() };
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : estadoInicial;
  } catch {
    return { ...estadoInicial, id: obtenerTokenCarrito() };
  }
}

let memoriaCarrito: CarritoRespuesta = leerCarritoLocal();
const oyentes = new Set<() => void>();

function emitirCambio(nuevoEstado: CarritoRespuesta) {
  memoriaCarrito = nuevoEstado;
  try {
    localStorage.setItem(CLAVE_DATOS_CARRITO, JSON.stringify(nuevoEstado));
    if (nuevoEstado.id) {
      localStorage.setItem(CLAVE_TOKEN_CARRITO, nuevoEstado.id);
    }
  } catch {
    /* Fallback en memoria */
  }
  oyentes.forEach(fn => fn());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

function obtenerInstantanea() {
  return memoriaCarrito;
}

export function useCarrito() {
  const carrito = useSyncExternalStore(suscribir, obtenerInstantanea);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeNotificacion, setMensajeNotificacion] = useState<string>('');

  // Sincronizar con el backend al iniciar y al cambiar el estado de sesión
  useEffect(() => {
    let activo = true;

    const sincronizarConBackend = () => {
      const token = obtenerTokenCarrito();
      ServicioCarrito.obtenerCarrito(token)
        .then(datos => {
          if (activo && datos) {
            emitirCambio(datos);
          }
        })
        .catch(() => {
          // En caso de fallo inicial de red, permanece con la copia local
        });
    };

    sincronizarConBackend();

    const onLogin = () => sincronizarConBackend();
    const onExpired = () => {
      localStorage.removeItem(CLAVE_TOKEN_CARRITO);
      localStorage.removeItem(CLAVE_DATOS_CARRITO);
      emitirCambio({ ...estadoInicial, id: obtenerTokenCarrito() });
      sincronizarConBackend();
    };

    window.addEventListener('lys-login-success', onLogin);
    window.addEventListener('lys-session-expired', onExpired);

    return () => {
      activo = false;
      window.removeEventListener('lys-login-success', onLogin);
      window.removeEventListener('lys-session-expired', onExpired);
    };
  }, []);

  const agregar = useCallback(async (productoId: string, cantidad = 1) => {
    setCargando(true);
    setError(null);
    const token = obtenerTokenCarrito();

    try {
      const actualizado = await ServicioCarrito.agregarItem(productoId, cantidad, token);
      emitirCambio(actualizado);
      setMensajeNotificacion(`Producto agregado al carrito.`);
    } catch (err) {
      const msj = err instanceof Error ? err.message : 'No se pudo agregar al carrito';
      setError(msj);
      setMensajeNotificacion(msj);
    } finally {
      setCargando(false);
    }
  }, []);

  const actualizarCantidad = useCallback(async (productoId: string, cantidad: number) => {
    setCargando(true);
    setError(null);
    const token = obtenerTokenCarrito();

    try {
      const actualizado = await ServicioCarrito.actualizarCantidad(productoId, cantidad, token);
      emitirCambio(actualizado);
    } catch (err) {
      const msj = err instanceof Error ? err.message : 'No se pudo actualizar la cantidad';
      setError(msj);
    } finally {
      setCargando(false);
    }
  }, []);

  const eliminar = useCallback(async (productoId: string) => {
    setCargando(true);
    setError(null);
    const token = obtenerTokenCarrito();

    try {
      const actualizado = await ServicioCarrito.eliminarItem(productoId, token);
      emitirCambio(actualizado);
      setMensajeNotificacion('Producto eliminado del carrito.');
    } catch (err) {
      const msj = err instanceof Error ? err.message : 'No se pudo eliminar el producto';
      setError(msj);
    } finally {
      setCargando(false);
    }
  }, []);

  const vaciar = useCallback(async () => {
    setCargando(true);
    setError(null);
    const token = obtenerTokenCarrito();

    try {
      const actualizado = await ServicioCarrito.vaciarCarrito(token);
      emitirCambio(actualizado);
      setMensajeNotificacion('El carrito ha sido vaciado.');
    } catch (err) {
      const msj = err instanceof Error ? err.message : 'No se pudo vaciar el carrito';
      setError(msj);
    } finally {
      setCargando(false);
    }
  }, []);

  return {
    carrito,
    items: carrito.items || [],
    cantidadTotal: carrito.cantidadTotal || 0,
    total: carrito.total || 0,
    cargando,
    error,
    mensajeNotificacion,
    limpiarMensaje: () => setMensajeNotificacion(''),
    agregar,
    actualizarCantidad,
    eliminar,
    vaciar,
  };
}

export const usarCarrito = useCarrito;
