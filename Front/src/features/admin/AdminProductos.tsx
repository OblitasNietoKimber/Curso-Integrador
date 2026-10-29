import { AdminImageField } from './AdminImageField';
import { ServicioCategorias } from '../../services/ServicioCategorias';
import type { Categoria } from '../../tipos';
import { Pagination, downloadExcel } from './AdminShared';
import { useEffect, useMemo, useState } from "react";
import { actualizarProducto, cambiarActivoProducto, crearProducto, listarProductos, type AdminProducto, type ProductoForm, } from "./adminProductosApi";
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
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoria, setCategoria] = useState('');
    const [estado, setEstado] = useState('todos');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<string[]>([]);
    async function cargar() {
        try {
            const [products, categories] = await Promise.all([listarProductos(), ServicioCategorias.obtenerTodas()]);
            setProductos(products);
            setCategorias(categories);
            setError("");
        }
        catch (e) {
            setError(mensaje(e));
        }
        finally {
            setCargando(false);
        }
    }
    useEffect(() => {
        void cargar();
    }, []);
    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return productos.filter(p => (!categoria || p.categoriaId === categoria) && (estado === "todos" || p.activo === (estado === "activos"))).filter((p) => p.nombre.toLowerCase().includes(texto) || p.categoriaNombre.toLowerCase().includes(texto));
    }, [productos, busqueda, categoria, estado]);
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
        if (!editando)
            return;
        setGuardando(true);
        setError("");
        try {
            if (editando === "nuevo")
                await crearProducto(form);
            else
                await actualizarProducto(editando.id, form);
            setEditando(null);
            await cargar();
        }
        catch (e) {
            setError(mensaje(e));
        }
        finally {
            setGuardando(false);
        }
    }
    async function alternar(p: AdminProducto) {
        try {
            await cambiarActivoProducto(p.id, !p.activo);
            await cargar();
        }
        catch (e) {
            setError(mensaje(e));
        }
    }
    async function desactivarSeleccion() { setGuardando(true); try {
        for (const id of selected)
            await cambiarActivoProducto(id, false);
        setSelected([]);
    }
    catch (e) {
        setError(mensaje(e));
    }
    finally {
        await cargar();
        setGuardando(false);
    } }
    if (cargando)
        return <p role="status">Cargando productos…</p>;
    return (<section className="admin-productos">
      <div className="admin-toolbar">
        <input type="search" placeholder="Buscar por nombre o categoría" aria-label="Buscar productos" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}/>
        <select aria-label="Filtrar categoría" value={categoria} onChange={e => { setCategoria(e.target.value); setPage(1); }}><option value="">Todas las categorías</option>{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
        <select aria-label="Filtrar estado" value={estado} onChange={e => { setEstado(e.target.value); setPage(1); }}><option value="todos">Todos los estados</option><option value="activos">Activos</option><option value="inactivos">Inactivos</option></select>
        <button onClick={() => downloadExcel('Productos', ['Nombre', 'Categoría', 'Precio', 'Stock', 'Activo'], visibles.map(p => [p.nombre, p.categoriaNombre, p.precio, p.stock, p.activo]))}>Exportar Excel</button>
        <button disabled={!selected.length || guardando} onClick={() => void desactivarSeleccion()}>Desactivar selección ({selected.length})</button>
        <button className="primary-button" onClick={nuevo} disabled={categorias.length === 0}>
          Nuevo producto
        </button>
      </div>

      {error && <p role="alert">{error}</p>}

      {editando && (<form className="info-card admin-form" onSubmit={(e) => {
                e.preventDefault();
                void guardar();
            }}>
          <h2>{editando === "nuevo" ? "Nuevo producto" : "Editar producto"}</h2>

          <label>
            Nombre
            <input required maxLength={150} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}/>
          </label>

          <label>
            Categoría
            <select aria-label="Categoría" required value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
              {categorias.map((c) => (<option key={c.id} value={c.id}>
                  {c.nombre}
                </option>))}
            </select>
          </label>

          <label>
            Descripción
            <textarea maxLength={500} rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}/>
          </label>

          <div className="admin-form-row">
            <label>
              Precio (S/)
              <input required type="number" min="0.01" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}/>
            </label>
            <label>
              Stock
              <input type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}/>
            </label>
            <label>
              Tamaño
              <input maxLength={50} value={form.tamano} onChange={(e) => setForm({ ...form, tamano: e.target.value })}/>
            </label>
          </div>

          <label>
            Imagen (ruta)
            <AdminImageField value={form.imagen} onBusy={setGuardando} onChange={imagen => setForm(current => ({ ...current, imagen }))}/>
          </label>

          <div className="admin-form-row">
            <label className="admin-check">
              <input type="checkbox" checked={form.esNuevo} onChange={(e) => setForm({ ...form, esNuevo: e.target.checked })}/>
              Producto nuevo
            </label>
            <label className="admin-check">
              <input type="checkbox" checked={form.esPromocion} onChange={(e) => setForm({ ...form, esPromocion: e.target.checked })}/>
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
        </form>)}

      <p className="admin-count">
        {visibles.length} de {productos.length} productos
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Seleccionar</th><th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibles.slice((page - 1) * 10, page * 10).map((p) => (<tr key={p.id} className={p.activo ? "" : "admin-inactivo"}>
                <td><input type="checkbox" aria-label={'Seleccionar ' + p.nombre} checked={selected.includes(p.id)} onChange={e => setSelected(e.target.checked ? [...selected, p.id] : selected.filter(id => id !== p.id))}/></td>
                <td><img className="admin-thumbnail" src={p.imagen || '/images/logo.webp'} alt=""/>{p.nombre}</td>
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
              </tr>))}
            {visibles.length === 0 && (<tr>
                <td colSpan={7}>No se encontraron productos.</td>
              </tr>)}
          </tbody>
        </table>
      </div>
      <Pagination count={visibles.length} page={page} onPage={setPage}/>
    </section>);
}
