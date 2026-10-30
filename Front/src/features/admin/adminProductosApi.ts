import { apiRequest } from "../../services/api";

export type AdminProducto = {
  id: string;
  categoriaId: string;
  categoriaNombre: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  tamano: string | null;
  popularidad: number;
  esNuevo: boolean;
  esPromocion: boolean;
  imagen: string | null;
  stock: number;
  activo: boolean;
};

export type ProductoForm = {
  categoriaId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tamano: string;
  esNuevo: boolean;
  esPromocion: boolean;
  imagen: string;
  stock: number;
};

export const listarProductos = () => apiRequest<AdminProducto[]>("/admin/productos");

export const crearProducto = (datos: ProductoForm) =>
  apiRequest<AdminProducto>("/admin/productos", { method: "POST", body: JSON.stringify(datos) });

export const actualizarProducto = (id: string, datos: ProductoForm) =>
  apiRequest<AdminProducto>(`/admin/productos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

export const cambiarActivoProducto = (id: string, activo: boolean) =>
  apiRequest<AdminProducto>(`/admin/productos/${encodeURIComponent(id)}/activo`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });