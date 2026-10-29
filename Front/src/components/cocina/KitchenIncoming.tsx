import { useEffect, useState } from "react";
import { Icon } from "../caja/OperationsVisuals";
import { Empty } from "../caja/OperationsUI";
import { type Order, type Status } from "../../services/operationsStore";
import { KitchenChannel } from "./KitchenReferenceUI";
import { kitchenSearch, kitchenUrgent, kitchenElapsed } from "../../services/kitchenHelpers";

export function KitchenIncoming({
  orders,
  target,
  onDetail,
  onStatus,
}: {
  orders: Order[];
  target: number;
  onDetail: (order: Order) => void;
  onStatus: (id: string, status: Status) => void;
}) {
  const [channel, setChannel] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("antiguos");

  const [status, setStatus] = useState("Todos");
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const active = orders.filter(
    (o) => !["Entregado", "Cancelado", "En camino"].includes(o.status),
  );
  const matchChannel = (o: Order, value: string) =>
    value === "Todos" ||
    (value === "Urgentes" ? kitchenUrgent(o, target) : o.channel === value);
  const matches = active
    .filter(
      (o) =>
        matchChannel(o, channel) &&
        (status === "Todos" || o.status === status) &&
        kitchenSearch(o, search),
    )
    .sort((a, b) =>
      sort === "recientes"
        ? b.created.localeCompare(a.created)
        : a.created.localeCompare(b.created),
    );
  return (
    <div className="kr-incoming-layout ops-reference-incoming">
      <div className="kr-incoming-main">
        <div className="kr-toolbar">
          <div className="kr-tabs">
            {["Todos", "Salón", "Delivery", "Recojo"].map((value) => (
              <button
                key={value}
                aria-pressed={channel === value}
                className={channel === value ? "selected" : ""}
                onClick={() => setChannel(value)}
              >
                <Icon
                  name={
                    value === "Todos"
                      ? "list"
                      : value === "Salón"
                        ? "table"
                        : value === "Delivery"
                          ? "scooter"
                          : "bag"
                  }
                />
                {value} ({active.filter((o) => matchChannel(o, value)).length})
              </button>
            ))}
          </div>
          <select
            aria-label="Orden de pedidos entrantes"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="antiguos">Más antiguos primero</option>
            <option value="recientes">Más recientes primero</option>
          </select>
          <button className="ops-primary" onClick={() => { setStatus("Todos"); setSearch(""); setChannel("Todos"); setSort("antiguos"); }}>
            <Icon name="filter" />
            Eliminar filtros
          </button>
        </div>
        <div className="ops-incoming-search">
          <label>
            <Icon name="search" />
            <input
              aria-label="Buscar pedidos entrantes"
              placeholder="Buscar pedido, cliente o producto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        {(
          <div className="kr-toolbar">
            <select
              aria-label="Estado de pedidos entrantes"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {["Todos", "Recibido", "En preparación", "Listo"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>

          </div>
        )}
        <div className="kr-incoming-grid">
          {matches.map((order) => (
            <article className="kr-incoming-card" key={order.id}>
              <div className="ops-incoming-reference">
                <strong>#{order.id}</strong>
                <KitchenChannel order={order} />
                <span className="kitchen-payment" data-paid={order.paid}>{order.paid ? `Pagado${order.method ? ' · ' + order.method : ''}` : 'Pago pendiente'}</span>
                <small>
                  <Icon name="clock" />
                  En espera {kitchenElapsed((now - Date.parse(order.created)) / 1000)}
                </small>
                <time>
                  {new Date(order.created).toLocaleTimeString("es-PE", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: 'America/Lima',
                  })}
                </time>
              </div>
              <div className="ops-incoming-products">
                {order.items.map((line, i) => (
                  <div key={`${line.product.id}-${i}`}>
                    <img src={line.product.image || '/images/operations/plato-placeholder.svg'} alt="" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/operations/plato-placeholder.svg'; }} />
                    <div>
                      <strong>
                        {line.count} × {line.product.name}
                      </strong>
                      <small>{line.product.description}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cocina-incoming-actions">
                {order.notes && (
                  <p>
                    <Icon name="receipt" />
                    <span>
                      <strong>Nota del cliente</strong>
                      {order.notes}
                    </span>
                  </p>
                )}
                <button onClick={() => onDetail(order)}>
                  <Icon name="eye" />
                  Ver detalle
                </button>
                {order.status === "Recibido" ? (
                  <button
                    className="ops-primary"
                    onClick={() => onStatus(order.id, "En preparación")}
                  >
                    <Icon name="check" />
                    Aceptar pedido
                  </button>
                ) : order.status === "En preparación" ? (
                  <button
                    className="ops-primary"
                    aria-label="Marcar listo y enviar a Caja"
                    onClick={() => onStatus(order.id, "Listo")}
                  >
                    <Icon name="check" />
                    Listo · enviar a Caja
                  </button>
                ) : (
                  <span className="ops-badge green"><Icon name="check"/>Enviado a Caja</span>
                )}
              </div>
            </article>
          ))}
        </div>
        {!matches.length && (
          <Empty>No hay pedidos que coincidan con los filtros.</Empty>
        )}
      </div>
    </div>
  );
}
