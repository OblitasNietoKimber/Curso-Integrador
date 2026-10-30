import { useEffect, useMemo, useState } from "react";
import { ServicioProductos } from "../../services/ServicioProductos";
import type { Producto } from "../../tipos";
import { dinero, type NuevaVenta } from "../../services/cajaApi";
type Props = {
  turnoAbierto: boolean;
  ocupado: boolean;
  onGuardar: (venta: NuevaVenta) => Promise<boolean>;
};
export function CatalogoCaja({ turnoAbierto, ocupado, onGuardar }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]),
    [cargando, setCargando] = useState(true),
    [error, setError] = useState("");
  const [buscar, setBuscar] = useState(""),
    [categoria, setCategoria] = useState("todos");
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [cliente, setCliente] = useState(""),
    [canal, setCanal] = useState("Salón"),
    [mesa, setMesa] = useState("");
  async function cargar() {
    setCargando(true);
    setError("");
    try {
      setProductos(await ServicioProductos.obtenerTodos());
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo cargar el catálogo.",
      );
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => {
    let activo = true;
    ServicioProductos.obtenerTodos()
      .then((p) => {
        if (activo) setProductos(p);
      })
      .catch((e) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);
  const categorias = useMemo(
    () =>
      Array.from(
        new Map(
          productos.map((p) => [
            p.categoriaId,
            p.categoriaNombre || p.categoriaId,
          ]),
        ).entries(),
      ),
    [productos],
  );
  const visibles = productos.filter(
    (p) =>
      (categoria === "todos" || p.categoriaId === categoria) &&
      `${p.nombre} ${p.descripcion}`
        .toLowerCase()
        .includes(buscar.toLowerCase()),
  );
  const lineas = productos.filter((p) => (cantidades[p.id] || 0) > 0);
  const total =
    lineas.reduce(
      (s, p) => s + Math.round(p.precio * 100) * cantidades[p.id],
      0,
    ) / 100;
  function cantidad(p: Producto, n: number) {
    if (Number.isInteger(n) && n >= 0 && n <= Math.min(99, p.stock))
      setCantidades((prev) => ({ ...prev, [p.id]: n }));
  }
  return (
    <div className="dos-columnas venta-caja">
      <section className="panel">
        <div className="titulo">
          <h2>Productos del catálogo</h2>
          <button disabled={cargando || ocupado} onClick={() => void cargar()}>
            ↻ Actualizar
          </button>
        </div>
        <p>Elige los productos para preparar la cuenta de cobro.</p>
        <div className="filtros">
          <label>
            Buscar producto
            <input
              type="search"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Pollo, bebida, acompañamiento…"
            />
          </label>
          <label>
            Categoría
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="todos">Todas las categorías</option>
              {categorias.map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {cargando ? (
          <p role="status">Cargando productos…</p>
        ) : (
          <div className="caja-catalogo">
            {visibles.map((p) => (
              <button
                className="producto-caja"
                key={p.id}
                disabled={
                  ocupado ||
                  !turnoAbierto ||
                  p.stock < 1 ||
                  (cantidades[p.id] || 0) >= Math.min(99, p.stock)
                }
                onClick={() => cantidad(p, (cantidades[p.id] || 0) + 1)}
              >
                {p.imagen && <img src={p.imagen} alt="" loading="lazy" />}
                <b>{p.nombre}</b>
                <strong>{dinero(p.precio)}</strong>
                <small>
                  {p.stock > 0 ? `${p.stock} disponibles` : "Agotado"}
                  {cantidades[p.id] ? ` · ${cantidades[p.id]} en cuenta` : ""}
                </small>
              </button>
            ))}
          </div>
        )}
        {!cargando && !visibles.length && (
          <p className="vacio">No hay productos que coincidan.</p>
        )}
      </section>
      <section className="panel">
        <h2>Nueva cuenta</h2>
        {!turnoAbierto && (
          <p className="error">Abre caja para crear una venta.</p>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!lineas.length) return;
            if (
              await onGuardar({
                cliente,
                canal,
                mesa: canal === "Salón" ? mesa : "",
                items: lineas.map((p) => ({
                  productoId: p.id,
                  cantidad: cantidades[p.id],
                })),
              })
            ) {
              setCantidades({});
              setCliente("");
              setMesa("");
            }
          }}
        >
          <label>
            Cliente
            <input
              maxLength={150}
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Público general"
            />
          </label>
          <div className="filtros">
            <label>
              Canal
              <select value={canal} onChange={(e) => setCanal(e.target.value)}>
                {["Salón", "Recojo", "Delivery"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            {canal === "Salón" && (
              <label>
                Mesa
                <input
                  required
                  maxLength={20}
                  value={mesa}
                  onChange={(e) => setMesa(e.target.value)}
                  placeholder="Ej. 3"
                />
              </label>
            )}
          </div>
          {lineas.map((p) => (
            <div key={p.id} className="fila linea-venta">
              <div>
                <b>{p.nombre}</b>
                <small>{dinero(p.precio)} por unidad</small>
              </div>
              <div className="contador-linea">
                <button
                  type="button"
                  disabled={ocupado}
                  aria-label={"Reducir " + p.nombre}
                  onClick={() => cantidad(p, cantidades[p.id] - 1)}
                >
                  −
                </button>
                <input
                  aria-label={"Cantidad de " + p.nombre}
                  required
                  type="number"
                  min="1"
                  max={Math.min(99, p.stock)}
                  value={cantidades[p.id]}
                  onChange={(e) => cantidad(p, Number(e.target.value))}
                />
                <button
                  type="button"
                  disabled={
                    ocupado || cantidades[p.id] >= Math.min(99, p.stock)
                  }
                  aria-label={"Aumentar " + p.nombre}
                  onClick={() => cantidad(p, cantidades[p.id] + 1)}
                >
                  ＋
                </button>
              </div>
              <b>
                {dinero((Math.round(p.precio * 100) * cantidades[p.id]) / 100)}
              </b>
              <button
                type="button"
                className="texto"
                disabled={ocupado}
                aria-label={"Quitar " + p.nombre}
                onClick={() => cantidad(p, 0)}
              >
                ×
              </button>
            </div>
          ))}
          {!lineas.length && (
            <p className="vacio">Selecciona productos del catálogo.</p>
          )}
          <div className="total">
            <span>Total estimado</span>
            <strong>{dinero(total)}</strong>
          </div>
          <p>
            El servidor confirmará precios y disponibilidad al guardar la
            cuenta.
          </p>
          <button
            className="principal ancho"
            disabled={ocupado || !turnoAbierto || !lineas.length}
          >
            {ocupado ? "Enviando…" : "Enviar pedido a Cocina →"}
          </button>
        </form>
      </section>
    </div>
  );
}
