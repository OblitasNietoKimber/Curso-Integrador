import { minutes, type Order } from "./operationsStore";

export const kitchenSearch = (order: Order, search: string) =>
  `${order.id} ${order.customer} ${order.address} ${order.table ? `Mesa ${order.table}` : ""} ${order.items.map((item) => item.product.name).join(" ")}`
    .toLowerCase()
    .includes(search.toLowerCase().trim());
export const kitchenUrgent = (order: Order, target: number) =>
  /urgente/i.test(order.notes) ||
  (order.status !== "Listo" &&
    minutes(order.accepted || order.created) > target);
export const kitchenDuration = (order: Order) =>
  order.accepted && order.ready
    ? Math.max(
        0,
        Math.round(
          (Date.parse(order.ready) - Date.parse(order.accepted)) / 60000,
        ),
      )
    : 0;
export const kitchenDay = (date: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(date));
  const value = (name: string) => parts.find(p => p.type === name)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
};
export const kitchenTime = (date?: string) =>
  date
    ? new Date(date).toLocaleTimeString("es-PE", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: 'America/Lima',
      })
    : "—";

export const kitchenHour = (date: string) => Number(new Intl.DateTimeFormat('en-GB', {
  timeZone: 'America/Lima', hour: '2-digit', hourCycle: 'h23',
}).format(new Date(date)));

export function kitchenElapsed(value: number) {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days) return `${days} d ${hours} h`;
  if (hours) return `${hours} h ${String(minutes).padStart(2, '0')} min`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
