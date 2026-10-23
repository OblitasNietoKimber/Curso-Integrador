import { Icon, type IconName } from "./OperationsVisuals";
export function ChannelBadge({ channel }: { channel: string }) {
  const norm = channel.toLowerCase();
  const kind =
    norm.includes("salón") || norm.includes("salon")
      ? "salon"
      : norm.includes("delivery")
        ? "delivery"
        : "recojo";
  const label =
    kind === "salon" ? "Salón" : kind === "delivery" ? "Delivery" : "Recojo";
  const icon: IconName =
    kind === "salon" ? "table" : kind === "delivery" ? "scooter" : "bag";
  return (
    <span className={`ops-channel-badge ${kind}`}>
      <Icon name={icon} />
      {label}
    </span>
  );
}

export function InitialsAvatar({ name }: { name: string }) {
  const words = name.trim().split(/\s+/);
  const initials = (words[0]?.[0] || "") + (words[1]?.[0] || "");
  const tones = ["", "blue", "purple", "amber", "green"];
  const code = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  const tone = tones[code % tones.length];
  return (
    <span className={`ops-initials-avatar ${tone}`}>
      {initials.toUpperCase() || "U"}
    </span>
  );
}
