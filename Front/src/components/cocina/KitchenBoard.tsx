import { useEffect, useState } from "react";
import { Icon, type IconName } from "../caja/OperationsVisuals";
import { Empty } from "../caja/OperationsUI";
import { minutes, type Order, type Status } from "../../services/operationsStore";
import { kitchenElapsed } from '../../services/kitchenHelpers';

const stages: { status: Status; title: string; icon: IconName }[] = [
  { status: "Recibido", title: "Nuevos", icon: "receipt" },
  { status: "En preparación", title: "En preparación", icon: "chef" },
  { status: "Listo", title: "Listos para Caja", icon: "check" },
];
export function KitchenBoard({
  orders,
  target,
  onDetail,
  onStatus,
  navigate,
}: {
  orders: Order[];
  target: number;
  onDetail: (order: Order) => void;
  onStatus: (id: string, status: Status) => void;
  navigate: (path: string) => void;
}) {
  const [channel, setChannel] = useState("Todos");
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("Todos");
  const [oldestFirst, setOldestFirst] = useState(true);
  const [stageTab, setStageTab] = useState<Status>("Recibido");
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const visible = orders.filter(
    (o) => !["Entregado", "Cancelado"].includes(o.status),
  );
  const urgent = (o: Order) =>
    ['Recibido', 'En preparación'].includes(o.status) && minutes(o.accepted || o.created) > target;
  const channelMatches = (o: Order, value: string) =>
    value === "Todos" ||
    (value === "Urgentes" ? urgent(o) : o.channel === value);
  const filtered = visible
    .filter(
      (o) =>
        channelMatches(o, channel) &&
        (statusFilter === "Todos" || o.status === statusFilter) &&
        `${o.id} ${o.customer} ${o.table ? `Mesa ${o.table}` : ""} ${o.items.map((l) => l.product.name).join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase().trim()),
    )
    .sort((a, b) =>
      oldestFirst
        ? a.created.localeCompare(b.created)
        : b.created.localeCompare(a.created),
    );
  const forStage = (status: Status) =>
    filtered.filter(
      (o) =>
        o.status === status || (status === "Listo" && o.status === "En camino"),
    );
  return (
    <div className="kitchen-board ops-reference-kitchen">
      <details className="ops-kitchen-tools">
        <summary>
          <Icon name="search" />
          Buscar y filtrar
        </summary>
        <div className="kitchen-toolbar">
          <div className="kitchen-tabs" aria-label="Filtrar pedidos por origen">
            {["Todos", "Urgentes", "Delivery", "Salón", "Recojo"].map(
              (value) => (
                <button
                  key={value}
                  aria-pressed={channel === value}
                  className={channel === value ? "selected" : ""}
                  onClick={() => setChannel(value)}
                >
                  {value} (
                  {visible.filter((o) => channelMatches(o, value)).length})
                </button>
              ),
            )}
          </div>
          <label className="kitchen-search">
            <Icon name="search" />
            <input
              aria-label="Buscar pedidos de cocina"
              placeholder="Pedido, mesa o producto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button
            className="ops-primary"
            onClick={() => { setChannel("Todos"); setSearch(""); setStatusFilter("Todos"); setOldestFirst(true); }}
          >
            <Icon name="filter" />
            Eliminar filtros
          </button>
        </div>
        {(
          <div id="kitchen-filters" className="kitchen-filters">
            <label>
              Estado
              <select
                aria-label="Estado de pedidos de cocina"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {["Todos", ...stages.map((s) => s.status), "En camino"].map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              Orden
              <select
                aria-label="Orden de pedidos de cocina"
                value={oldestFirst ? "antiguos" : "recientes"}
                onChange={(e) => setOldestFirst(e.target.value === "antiguos")}
              >
                <option value="antiguos">Más antiguos primero</option>
                <option value="recientes">Más recientes primero</option>
              </select>
            </label>

          </div>
        )}
      </details>
      <div className="ops-stage-tabs" aria-label="Etapas de cocina">
        {stages.map((s) => (
          <button
            key={s.status}
            aria-pressed={stageTab === s.status}
            onClick={() => setStageTab(s.status)}
          >
            {s.title} ({forStage(s.status).length})
          </button>
        ))}
      </div>
      <div className="ops-kanban kitchen-columns">
        {stages.map((stage) => (
          <section
            className="kitchen-column"
            key={stage.status}
            data-stage={stage.status}
            data-mobile-active={stageTab === stage.status}
            aria-label={stage.title}
          >
            <header className="kitchen-column-heading">
              <Icon name={stage.icon} />
              <h2>
                {stage.title} ({forStage(stage.status).length})
              </h2>
            </header>
            {forStage(stage.status).map((order) => {
              const ready = ["Listo", "En camino"].includes(order.status);
              const seconds = Math.max(
                0,
                Math.floor(
                  (now -
                    Date.parse(
                      ready
                        ? order.ready || order.created
                        : order.accepted || order.created,
                    )) /
                    1000,
                ),
              );
              const timer = kitchenElapsed(seconds);
              const count = order.items.reduce((sum, line) => sum + line.count, 0);
              return (
                <article
                  className="kitchen-ticket"
                  key={order.id}
                  data-status={order.status}
                  data-urgent={!ready && seconds > target * 60}
                >
                  <div className="ops-kitchen-ticket-main">
                    {order.items[0]?.product.image ? <img
                      src={order.items[0].product.image}
                      alt=""
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/operations/plato-placeholder.svg'; }}
                    /> : <span className="kitchen-product-placeholder" aria-hidden="true"><Icon name="chef"/></span>}
                    <div>
                      <header>
                        <button
                          className="kitchen-ticket-id"
                          title={`Pedido ${order.id}`}
                          aria-label={`Ver pedido ${order.id}`}
                          onClick={() => onDetail(order)}
                        >
                          #{order.id}
                        </button>
                        <time>
                          {new Date(order.created).toLocaleTimeString("es-PE", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: 'America/Lima',
                          })}
                        </time>
                      </header>
                      <div className="kitchen-channel">
                        {order.table
                          ? `Mesa ${String(order.table).padStart(2, "0")}`
                          : order.channel}
                        <span>{count} {count === 1 ? 'plato' : 'platos'}</span>
                        <span className="kitchen-payment" data-paid={order.paid}>{order.paid ? `Pagado${order.method ? ' · ' + order.method : ''}` : 'Pago pendiente'}</span>
                      </div>
                      <ul>
                        {order.items.map((line, i) => (
                          <li key={`${line.product.id}-${i}`}>
                            {line.count} × {line.product.name}
                          </li>
                        ))}
                      </ul>
                      {order.notes && (
                        <p className="kitchen-note">Nota: {order.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="kitchen-ticket-actions">
                    <span
                      className={`ops-kitchen-elapsed ${ready ? "is-ready" : ""}`}
                    >
                      <Icon name="clock" />
                      <span><small>{ready ? 'Esperando cobro' : order.status === 'Recibido' ? 'En espera' : 'Preparando'}</small>{timer}</span>
                    </span>
                    {order.status === "Recibido" ? (
                      <button
                        className="ops-primary"
                        aria-label="Aceptar pedido"
                        onClick={() => onStatus(order.id, "En preparación")}
                      >
                        Aceptar pedido
                      </button>
                    ) : order.status === "En preparación" ? (
                      <button
                        className="ops-kitchen-ready-action"
                        aria-label="Marcar listo y enviar a Caja"
                        onClick={() => onStatus(order.id, "Listo")}
                      >
                        Listo · enviar a Caja
                      </button>
                    ) : (
                      <button
                        className="ops-kitchen-deliver-action"
                        aria-label="Ver pedido enviado a Caja"
                        onClick={() => onDetail(order)}
                      >
                        Ver pedido
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
            {!forStage(stage.status).length && (
              <Empty>No hay pedidos en este estado.</Empty>
            )}
          </section>
        ))}
      </div>
      <button
        className="ops-kitchen-history-link"
        onClick={() => navigate("/cocina/historial")}
      >
        <Icon name="clock" />
        Ver historial completo
      </button>
    </div>
  );
}
