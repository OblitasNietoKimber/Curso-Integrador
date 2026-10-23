import { useEffect, useMemo, useState } from "react";
import {
  actualizarProducto,
  cambiarActivoProducto,
  crearProducto,
  listarProductos,
  type AdminProducto,
  type ProductoForm,
} from "./adminProductosApi";

const vacio: ProductoForm = {
  categoriaId: "",
  nombre: "",
  descripcion: "",
  precio: 0,
  tamano: "",
  esNuevo: false,
  esPromocion: false,
  imagen: "",
  stock: 0,
};

const mensaje = (e: unknown) => (e instanceof Error ? e.message : "Ocurrió un error inesperado.");

export function AdminProductos() {
  const [productos, setProductos] = useState<AdminProducto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<AdminProducto | "nuevo" | null>(null);
  const [form, setForm] = useState<ProductoForm>(vacio);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      setProductos(await listarProductos());
      setError("");
    } catch (e) {
      setError(mensaje(e));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
  }, []);

  const categorias = useMemo(() => {
    const mapa = new Map<string, string>();
    productos.forEach((p) => mapa.set(p.categoriaId, p.categoriaNombre));
    return [...mapa.entries()].map(([id, nombre]) => ({ id, nombre }));
  }, [productos]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return productos;
    return productos.filter(
      (p) => p.nombre.toLowerCase().includes(texto) || p.categoriaNombre.toLowerCase().includes(texto),
    );
  }, [productos, busqueda]);

  function nuevo() {
    setForm({ ...vacio, categoriaId: categorias[0]?.id ?? "" });
    setEditando("nuevo");
    setError("");
  }

  function editar(p: AdminProducto) {
    setForm({
      categoriaId: p.categoriaId,
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      precio: p.precio,
      tamano: p.tamano ?? "",
      esNuevo: p.esNuevo,
      esPromocion: p.esPromocion,
      imagen: p.imagen ?? "",
      stock: p.stock,
    });
    setEditando(p);
    setError("");
  }

  async function guardar() {
    if (!editando) return;
    setGuardando(true);
    setError("");
    try {
      if (editando === "nuevo") await crearProducto(form);
      else await actualizarProducto(editando.id, form);
      setEditando(null);
      await cargar();
    } catch (e) {
      setError(mensaje(e));
    } finally {
      setGuardando(false);
    }
  }

  async function alternar(p: AdminProducto) {
    try {
      await cambiarActivoProducto(p.id, !p.activo);
      await cargar();
    } catch (e) {
      setError(mensaje(e));
    }
  }

  if (cargando) return <p role="status">Cargando productos…</p>;

  return (
    <section className="admin-productos">
      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Buscar por nombre o categoría"
          aria-label="Buscar productos"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="primary-button" onClick={nuevo} disabled={categorias.length === 0}>
          Nuevo producto
        </button>
      </div>

      {error && <p role="alert">{error}</p>}

      {editando && (
        <form
          className="info-card admin-form"
          onSubmit={(e) => {
            e.preventDefault();
            void guardar();
          }}
        >
          <h2>{editando === "nuevo" ? "Nuevo producto" : "Editar producto"}</h2>

          <label>
            Nombre
            <input required maxLength={150} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </label>

          <label>
            Categoría
            <select required value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Descripción
            <textarea maxLength={500} rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </label>

          <div className="admin-form-row">
            <label>
              Precio (S/)
              <input required type="number" min="0.01" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
            </label>
            <label>
              Stock
              <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </label>
            <label>
              Tamaño
              <input maxLength={50} value={form.tamano} onChange={(e) => setForm({ ...form, tamano: e.target.value })} />
            </label>
          </div>

          <label>
            Imagen (ruta)
            <input maxLength={255} value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} />
          </label>

          <div className="admin-form-row">
            <label className="admin-check">
              <input type="checkbox" checked={form.esNuevo} onChange={(e) => setForm({ ...form, esNuevo: e.target.checked })} />
              Producto nuevo
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={form.esPromocion} onChange={(e) => setForm({ ...form, esPromocion: e.target.checked })} />
              En promoción
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="button" className="info-button" onClick={() => setEditando(null)}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      )}

      <p className="admin-count">
        {visibles.length} de {productos.length} productos
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((p) => (
              <tr key={p.id} className={p.activo ? "" : "admin-inactivo"}>
                <td>{p.nombre}</td>
                <td>{p.categoriaNombre}</td>
                <td>S/ {Number(p.precio).toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>{p.activo ? "Activo" : "Inactivo"}</td>
                <td className="admin-acciones">
                  <button className="info-button" onClick={() => editar(p)}>
                    Editar
                  </button>
                  <button className="info-button" onClick={() => void alternar(p)}>
                    {p.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
            {visibles.length === 0 && (
              <tr>
                <td colSpan={6}>No se encontraron productos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}