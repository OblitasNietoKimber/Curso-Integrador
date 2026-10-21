import { useState } from 'react';
import { Icono, type NombreIcono } from '../Icono';
import type { Promocion } from '../../tipos';

interface PropiedadesTarjetaPromocion {
  promocion: Promocion;
  alAgregar: (id: string, cantidad: number) => void;
}

export function TarjetaPromocion({ promocion, alAgregar }: PropiedadesTarjetaPromocion) {
  const [cantidad, setCantidad] = useState(1);

  const ahorro =
    promocion.precioOriginal && promocion.precioOriginal > promocion.precio
      ? promocion.precioOriginal - promocion.precio
      : null;

  return (
    <article className="promo-offer-card">
      <svg className="promo-offer-border-trace" aria-hidden="true" focusable="false">
        <rect x="1" y="1" rx="17" pathLength="100" />
      </svg>

      <div className="promo-offer-photo">
        <img
          src={promocion.imagen}
          alt={promocion.nombre}
          width="960"
          height="430"
          loading="lazy"
        />
        {promocion.insignia && (
          <span className={`promo-offer-badge ${promocion.tonoInsignia || 'orange'}`}>
            <Icono name={(promocion.iconoInsignia as NombreIcono) || 'tag'} />
            {promocion.insignia}
          </span>
        )}
      </div>

      <div className="promo-offer-info">
        <h2>{promocion.nombre}</h2>
        <p className="promo-offer-description">{promocion.descripcion}</p>

        <div className="promo-offer-price">
          <strong>S/ {promocion.precio.toFixed(2)}</strong>
          {promocion.precioOriginal && (
            <del aria-label={`Precio anterior S/ ${promocion.precioOriginal.toFixed(2)}`}>
              S/ {promocion.precioOriginal.toFixed(2)}
            </del>
          )}
          {ahorro && <span>Ahorras S/ {ahorro.toFixed(2)}</span>}
        </div>

        <div className="promo-offer-actions">
          <div
            className="promo-offer-quantity"
            role="group"
            aria-label={`Cantidad de ${promocion.nombre}`}
          >
            <button
              type="button"
              disabled={cantidad <= 1}
              aria-label={`Reducir cantidad de ${promocion.nombre}`}
              onClick={() => setCantidad(c => Math.max(1, c - 1))}
            >
              −
            </button>
            <output aria-label="Cantidad">{cantidad}</output>
            <button
              type="button"
              disabled={cantidad >= 99}
              aria-label={`Aumentar cantidad de ${promocion.nombre}`}
              onClick={() => setCantidad(c => Math.min(99, c + 1))}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="promo-offer-add"
            aria-label={`Agregar ${promocion.nombre} al pedido`}
            onClick={() => alAgregar(promocion.id, cantidad)}
          >
            <Icono name="cart" />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </article>
  );
}
