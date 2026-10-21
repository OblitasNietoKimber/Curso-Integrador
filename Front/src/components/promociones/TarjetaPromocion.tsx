import { useState } from 'react';
import { Icon, type IconName } from '../Icon';
import { soles } from '../../utils/formato';
import type { Promocion } from '../../tipos';

interface PropiedadesTarjetaPromocion {
  promocion: Promocion;
  alAgregar: (id: string, cantidad: number) => void;
}

export function TarjetaPromocion({ promocion, alAgregar }: PropiedadesTarjetaPromocion) {
  const [count, setCount] = useState(1);

  const precioOriginal = promocion.precioOriginal ?? Math.round(promocion.precio * 1.35 * 10) / 10;
  const ahorro = Math.max(0, precioOriginal - promocion.precio);
  const badgeTone = promocion.tonoInsignia === 'red' ? 'red' : 'orange';
  const badgeIcon = (promocion.iconoInsignia as IconName) || 'pumpkin';
  const badge = promocion.insignia || 'EDICIÓN HALLOWEEN';
  const esBebida = promocion.filtros?.includes('bebidas');

  return (
    <article className="promo-offer-card">
      <svg className="promo-offer-border-trace" aria-hidden="true" focusable="false">
        <rect x="1" y="1" rx="17" pathLength="100" />
      </svg>
      <div className={`promo-offer-photo${esBebida ? ' promo-offer-photo-beverage' : ''}`}>
        <img
          src={promocion.imagen}
          alt={promocion.descripcion}
          width="960"
          height="430"
          loading="lazy"
        />
        <span className={`promo-offer-badge ${badgeTone}`}>
          <Icon name={badgeIcon} />
          {badge}
        </span>
      </div>
      <div className="promo-offer-info">
        <h2>{promocion.nombre}</h2>
        <p className="promo-offer-description">{promocion.descripcion}</p>
        <div className="promo-offer-price">
          <strong>{soles(promocion.precio)}</strong>
          {precioOriginal > promocion.precio && (
            <del aria-label={`Precio anterior ${soles(precioOriginal)}`}>
              {soles(precioOriginal)}
            </del>
          )}
          {ahorro > 0 && <span>Ahorras {soles(ahorro)}</span>}
        </div>
        <div className="promo-offer-actions">
          <div
            className="promo-offer-quantity"
            role="group"
            aria-label={`Cantidad de ${promocion.nombre}`}
          >
            <button
              type="button"
              disabled={count === 1}
              aria-label={`Reducir cantidad de ${promocion.nombre}`}
              onClick={() => setCount(value => Math.max(1, value - 1))}
            >
              −
            </button>
            <output aria-label="Cantidad">{count}</output>
            <button
              type="button"
              disabled={count === 99}
              aria-label={`Aumentar cantidad de ${promocion.nombre}`}
              onClick={() => setCount(value => Math.min(99, value + 1))}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="promo-offer-add"
            aria-label={`Agregar ${promocion.nombre}`}
            onClick={() => alAgregar(promocion.id, count)}
          >
            <Icon name="cart" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </article>
  );
}
