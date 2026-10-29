import { useState, useEffect, useRef } from 'react';
import { crearPedidoWeb } from '../services/pedidosApi';
import { EstadoPedido } from '../components/carrito/EstadoPedido';
import type { Pedido } from '../services/cajaApi';
import { Icon } from '../components/Icon';
import { soles } from '../utils/formato';
import { usarCarrito } from '../hooks/usarCarrito';
import { useSession } from '../services/session';
import { useAccount } from '../features/account/accountStore';
import type { ItemCarrito } from '../tipos';

interface PropiedadesPaginaCarrito {
  alNavegar: (ruta: string) => void;
}

type DeliveryMode = 'delivery' | 'pickup';
type PaymentMethod = 'card' | 'yape' | 'plin' | 'cash';

interface DeliveryDraft {
  mode: DeliveryMode;
  address: string;
  district: string;
  reference: string;
  instructions: string;
  name: string;
  phone: string;
  email: string;
  store: string;
}

interface ConfirmedReceipt {
  pedido: Pedido;
  code: string;
  date: string;
  items: ItemCarrito[];
  delivery: DeliveryDraft;
  method: PaymentMethod;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

const steps = ['Carrito', 'Dirección y entrega', 'Método de pago', 'Confirmación'];

const suggestions = [
  {
    id: 'acompanamientos-03',
    name: 'Papas Nativas Rústicas',
    description: 'Papas nativas fritas en corte rústico, con sal de mar.',
    price: 14.9,
    image: '/images/carta/products/acompanamientos-03.webp',
  },
  {
    id: 'acompanamientos-06',
    name: 'Tequeños a la Brasa (8 und)',
    description: 'Rellenos de pollo a la brasa deshilachado y queso.',
    price: 18.9,
    image: '/images/carta/products/acompanamientos-06.webp',
  },
  {
    id: 'salsas-01',
    name: 'Ají Pollero Tradicional (250 ml)',
    description: 'El clásico ají de la casa.',
    price: 8.9,
    image: '/images/carta/products/salsas-01.webp',
  },
];

export function PaginaCarrito({ alNavegar }: PropiedadesPaginaCarrito) {
  const {
    items,
    cantidadTotal,
    total,
    actualizarCantidad,
    eliminar,
    vaciar,
    agregar,
  } = usarCarrito();

  const { user } = useSession();
  const { profile, addresses } = useAccount();

  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const sendingLock = useRef(false);
  const requestId = useRef(crypto.randomUUID());
  const [confirmedReceipt, setConfirmedReceipt] = useState<ConfirmedReceipt | null>(null);

  // Datos de entrega
  const [delivery, setDelivery] = useState<DeliveryDraft>({
    mode: 'delivery',
    address: '',
    district: 'Los Olivos',
    reference: '',
    instructions: '',
    name: '',
    phone: '',
    email: '',
    store: 'Local Principal - Av. Túpac Amaru 3420, Comas',
  });

  // Método de pago
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('4557 8821 3490 1205');
  const [expiry, setExpiry] = useState('11/28');
  const [walletPhone, setWalletPhone] = useState('');
  const [approvalCode, setApprovalCode] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [exact, setExact] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  // Proteger pasos de compra: no se puede avanzar sin estar autenticado
  useEffect(() => {
    if (step > 0 && !user) {
      localStorage.setItem('lys-return-after-login', '/carrito');
      alNavegar('/iniciar-sesion');
    }
  }, [step, user, alNavegar]);

  // Sincronizar datos de contacto y entrega con la cuenta del usuario logeado
  useEffect(() => {
    if (user) {
      setDelivery(prev => {
        const primaryAddress = addresses.find(a => a.primary) || addresses[0];
        return {
          ...prev,
          name: prev.name || profile.name || user.name || '',
          phone: prev.phone || profile.phone || user.phone || '',
          email: prev.email || profile.email || user.email || '',
          address: prev.address || primaryAddress?.street || '',
          district: prev.district && prev.district !== 'Los Olivos' ? prev.district : (primaryAddress?.district || 'Los Olivos'),
          reference: prev.reference || primaryAddress?.reference || '',
        };
      });
      if (!walletPhone) {
        const userPhone = profile.phone || user.phone || '';
        if (userPhone.length === 9) setWalletPhone(userPhone);
      }
    }
  }, [user, profile, addresses, walletPhone]);

  const shippingCost = delivery.mode === 'delivery' ? 5.0 : 0.0;
  const totalFinal = Math.round((total + shippingCost) * 100) / 100;

  function handleDeliverySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      localStorage.setItem('lys-return-after-login', '/carrito');
      alNavegar('/iniciar-sesion');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      localStorage.setItem('lys-return-after-login', '/carrito');
      alNavegar('/iniciar-sesion');
      return;
    }
    if (method === 'cash') {
      const parsedCash = exact ? totalFinal : Number(cashAmount);
      if (!exact && (!Number.isFinite(parsedCash) || parsedCash < totalFinal)) {
        setErrorPago('El monto ingresado debe cubrir el total del pedido.');
        return;
      }
    }

    if (method === 'yape' || method === 'plin') {
      if (walletPhone.trim().length !== 9) {
        setErrorPago('Ingresa un número de celular válido de 9 dígitos.');
        return;
      }
      if (approvalCode.trim().length !== 6) {
        setErrorPago('Ingresa el código de aprobación de 6 dígitos emitido por tu app.');
        return;
      }
    }

    setErrorPago('');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  async function handleConfirmOrder() {
    if (sendingLock.current) return;
    if (!user) {
      localStorage.setItem('lys-return-after-login', '/carrito');
      alNavegar('/iniciar-sesion');
      return;
    }
    sendingLock.current = true;
    setSending(true);
    setErrorPago('');
    try {
    const pedido = await crearPedidoWeb({
      solicitud: requestId.current, cliente: delivery.name, canal: delivery.mode === 'delivery' ? 'Delivery' : 'Recojo',
      direccion: delivery.mode === 'delivery' ? `${delivery.address}, ${delivery.district}` : delivery.store,
      telefono: delivery.phone, notas: [delivery.instructions, delivery.reference].filter(Boolean).join(' · '),
      items: items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
    });
    const receipt: ConfirmedReceipt = {
      pedido,
      code: pedido.id,
      date: pedido.creado!,
      items: pedido.items.map(i => ({ productoId: i.productoId, nombre: i.producto, imagen: items.find(item => item.productoId === i.productoId)?.imagen || '', precioUnitario: i.precio, cantidad: i.cantidad, subtotal: i.precio * i.cantidad })),
      delivery: { ...delivery },
      method,
      subtotal: pedido.total - (pedido.envio || 0),
      shipping: pedido.envio || 0,
      discount: 0,
      total: pedido.total,
    };
    setConfirmedReceipt(receipt);
    void vaciar();
    window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) { setErrorPago(e instanceof Error ? e.message : 'No se pudo registrar el pedido.'); }
    finally { sendingLock.current = false; setSending(false); }
  }

  // Si ya se confirmó el pedido, mostramos pantalla de resultado
  if (confirmedReceipt) {
    const dateObj = new Date(confirmedReceipt.date);
    return (
      <main id="contenido" className="checkout-page checkout-result-page">
        <div className="checkout-container">
          <div className="checkout-result">
            <div className="checkout-result-heading">
              <svg className="checkout-confetti" viewBox="0 0 800 180" aria-hidden="true">
                <g fill="#ef0008">
                  <path d="m135 40 12 8-5 10-12-8zm68 65 10-4 5 15-10 4zm-75 35 8 3-4 15-8-3zm480-84 13-8 5 8-13 8zm67 64 8 4-7 15-8-4z" />
                </g>
                <g fill="#efa035">
                  <path d="m225 23 13 7-5 8-13-7zm-10 115 8 4-5 13-8-4zm395-6 10 3-4 14-10-3zm-80-87 12-6 4 9-12 6zm-238-33 7 6-10 11-7-6z" />
                </g>
              </svg>
              <span className="checkout-success-icon">
                <Icon name="check" />
              </span>
              <h1>¡Pedido confirmado!</h1>
              <p>Tu pedido se registró con éxito. Puedes revisar todos los detalles aquí.</p>
              <small>El pedido fue enviado a cocina para su preparación inmediata.</small>
            </div>

            <EstadoPedido inicial={confirmedReceipt.pedido}/>
            <div className="checkout-layout">
              <section className="checkout-panel">
                <div className="checkout-order-code">
                  <Icon name="receipt" />
                  <div>
                    <span>Código de pedido</span>
                    <strong>#{confirmedReceipt.code}</strong>
                  </div>
                  <div>
                    <span>Fecha y hora</span>
                    <b>
                      {dateObj.toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </b>
                    <small>
                      {dateObj.toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </small>
                  </div>
                </div>

                <dl className="checkout-order-details">
                  <div>
                    <dt>
                      <Icon name="clock" />Tiempo estimado
                    </dt>
                    <dd>
                      <strong>25 – 35 minutos</strong>
                      <small>Preparando con el auténtico sabor a la brasa</small>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Icon name="pin" />
                      {confirmedReceipt.delivery.mode === 'delivery'
                        ? 'Dirección de entrega'
                        : 'Recojo en local'}
                    </dt>
                    <dd>
                      <strong>
                        {confirmedReceipt.delivery.mode === 'delivery'
                          ? confirmedReceipt.delivery.address
                          : confirmedReceipt.delivery.store}
                      </strong>
                      <p>{confirmedReceipt.delivery.district}</p>
                      <small>
                        Referencia: {confirmedReceipt.delivery.reference || 'No aplica'}
                      </small>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Icon name="card" />Método de pago
                    </dt>
                    <dd>
                      <strong>
                        {
                          {
                            card: 'Tarjeta de crédito/débito',
                            yape: 'Yape',
                            plin: 'Plin',
                            cash: 'Efectivo al recibir',
                          }[confirmedReceipt.method]
                        }
                      </strong>
                      <span className="checkout-payment-status">
                        {confirmedReceipt.method === 'cash'
                          ? 'Pendiente de cobro al recibir'
                          : 'Pendiente de verificación en Caja'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Icon name="user" />Datos de contacto
                    </dt>
                    <dd>
                      <strong>{confirmedReceipt.delivery.name}</strong>
                      <small>
                        {confirmedReceipt.delivery.phone} · {confirmedReceipt.delivery.email}
                      </small>
                    </dd>
                  </div>
                </dl>
              </section>

              <aside className="checkout-panel checkout-summary">
                <div className="checkout-panel-heading">
                  <h2>Resumen de tu pedido</h2>
                  <span>{confirmedReceipt.items.length} productos</span>
                </div>
                <ul className="checkout-summary-items">
                  {confirmedReceipt.items.map(item => (
                    <li key={item.productoId}>
                      <img src={item.imagen} alt="" width="88" height="72" />
                      <div>
                        <strong>{item.nombre}</strong>
                        <small>
                          {item.cantidad} × {soles(item.precioUnitario)}
                        </small>
                      </div>
                      <b>{soles(item.precioUnitario * item.cantidad)}</b>
                    </li>
                  ))}
                </ul>
                <div className="checkout-totals">
                  <p>
                    <span>Subtotal</span>
                    <strong>{soles(confirmedReceipt.subtotal)}</strong>
                  </p>
                  <p>
                    <span>Costo de envío</span>
                    <strong>{soles(confirmedReceipt.shipping)}</strong>
                  </p>
                  <p className="checkout-total">
                    <b>Total del pedido</b>
                    <strong>{soles(confirmedReceipt.total)}</strong>
                  </p>
                </div>
              </aside>
            </div>

            <div className="checkout-result-actions">
              <button
                type="button"
                className="checkout-outline"
                onClick={() => {
                  setConfirmedReceipt(null);
                  setStep(0);
                  alNavegar('/');
                }}
              >
                <Icon name="home" />
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="contenido" className="checkout-page">
      {step === 0 ? (
        <section className="checkout-hero">
          <picture>
            <source media="(max-width: 650px)" srcSet="/images/checkout/hero-mobile.webp" />
            <img
              src="/images/checkout/hero-desktop.webp"
              alt="Pollo a la brasa con papas fritas"
              width="1920"
              height="360"
            />
          </picture>
          <div>
            <h1>
              Tu <span>carrito</span>
            </h1>
            <p>
              Los mejores sabores a la brasa,
              <br />
              ahora más cerca de ti.
            </p>
          </div>
        </section>
      ) : (
        <nav className="checkout-progress checkout-container" aria-label="Pasos de compra">
          <ol>
            {steps.map((label, index) => (
              <li
                key={label}
                data-complete={step > index}
                aria-current={step === index ? 'step' : undefined}
              >
                <button
                  type="button"
                  disabled={index > step}
                  onClick={() => {
                    setStep(index);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                >
                  <span>{step > index ? <Icon name="check" /> : index + 1}</span>
                  <strong>
                    {index + 1}. {label}
                  </strong>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="checkout-container">
        <div className="checkout-layout">
          <div className="checkout-main-column">
            {/* Paso 0: Productos del carrito */}
            {step === 0 && (
              <>
                {!user && items.length > 0 && (
                  <div className="checkout-auth-banner" role="alert">
                    <Icon name="user" />
                    <div>
                      <strong>Inicia sesión para realizar tu pedido</strong>
                      <p>
                        Debes tener una cuenta activa para ingresar tus datos de entrega y confirmar la compra.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="checkout-auth-banner-button"
                      onClick={() => {
                        localStorage.setItem('lys-return-after-login', '/carrito');
                        alNavegar('/iniciar-sesion');
                      }}
                    >
                      Iniciar sesión
                    </button>
                  </div>
                )}
                <section
                  className="checkout-panel cart-products"
                  aria-labelledby="cart-products-title"
                >
                <div className="checkout-panel-heading">
                  <h2 id="cart-products-title">
                    <Icon name="cart" />
                    Productos en tu carrito ({cantidadTotal})
                  </h2>
                  {cantidadTotal > 0 && (
                    <button className="checkout-text-button" type="button" onClick={vaciar}>
                      <Icon name="trash" />
                      Vaciar carrito
                    </button>
                  )}
                </div>

                {items.length > 0 ? (
                  <ul className="cart-product-list">
                    {items.map(item => (
                      <li key={item.productoId}>
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          width="220"
                          height="150"
                        />
                        <div className="cart-product-copy">
                          <h3>{item.nombre}</h3>
                          <p>{item.descripcion}</p>
                        </div>
                        <div className="cart-unit-price">
                          <strong>{soles(item.precioUnitario)}</strong>
                          <small>Precio unitario</small>
                        </div>
                        <div
                          className="checkout-quantity"
                          role="group"
                          aria-label={`Cantidad de ${item.nombre}`}
                        >
                          <button
                            type="button"
                            disabled={item.cantidad <= 1}
                            aria-label={`Quitar una unidad de ${item.nombre}`}
                            onClick={() =>
                              actualizarCantidad(item.productoId, item.cantidad - 1)
                            }
                          >
                            −
                          </button>
                          <output>{item.cantidad}</output>
                          <button
                            type="button"
                            disabled={item.cantidad >= 99}
                            aria-label={`Agregar una unidad de ${item.nombre}`}
                            onClick={() =>
                              actualizarCantidad(item.productoId, item.cantidad + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <div className="cart-row-actions">
                          <button
                            type="button"
                            aria-label={`Eliminar ${item.nombre}`}
                            onClick={() => eliminar(item.productoId)}
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="checkout-empty">
                    <Icon name="cart" />
                    <h3>Tu carrito está esperando algo rico</h3>
                    <p>Encuentra tu próximo antojo en nuestra carta.</p>
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => alNavegar('/carta')}
                    >
                      Ver carta <Icon name="arrow" />
                    </button>
                  </div>
                )}
              </section>
            </>
            )}

            {/* Paso 1: Dirección y entrega */}
            {step === 1 && (
              <section className="checkout-panel delivery-step">
                <div className="checkout-section-heading">
                  <Icon name="pin" />
                  <div>
                    <h1>Dirección y entrega</h1>
                    <p>Indica cómo y dónde quieres recibir tu pedido</p>
                  </div>
                </div>

                <form id="delivery-form" onSubmit={handleDeliverySubmit}>
                  <fieldset>
                    <legend>Tipo de entrega</legend>
                    <div className="checkout-choice-grid">
                      <label
                        className="checkout-choice"
                        data-selected={delivery.mode === 'delivery'}
                      >
                        <Icon name="truck" />
                        <span>
                          <strong>Delivery</strong>
                          <small>Recibe tu pedido en la comodidad de tu casa u oficina.</small>
                        </span>
                        <input
                          type="radio"
                          name="delivery-mode"
                          value="delivery"
                          checked={delivery.mode === 'delivery'}
                          onChange={() => setDelivery({ ...delivery, mode: 'delivery' })}
                        />
                      </label>
                      <label
                        className="checkout-choice"
                        data-selected={delivery.mode === 'pickup'}
                      >
                        <Icon name="store" />
                        <span>
                          <strong>Recojo en local</strong>
                          <small>Haz tu pedido y recógelo en nuestro local.</small>
                        </span>
                        <input
                          type="radio"
                          name="delivery-mode"
                          value="pickup"
                          checked={delivery.mode === 'pickup'}
                          onChange={() => setDelivery({ ...delivery, mode: 'pickup' })}
                        />
                      </label>
                    </div>
                  </fieldset>

                  {delivery.mode === 'delivery' ? (
                    <>
                      <h2 className="checkout-field-heading">Datos de entrega</h2>
                      {addresses && addresses.length > 0 && (
                        <div className="checkout-saved-addresses">
                          <span>Tus direcciones registradas:</span>
                          <div className="checkout-address-chips">
                            {addresses.map(addr => (
                              <button
                                key={addr.id}
                                type="button"
                                className={`checkout-chip ${delivery.address === addr.street ? 'selected' : ''}`}
                                onClick={() => {
                                  setDelivery(prev => ({
                                    ...prev,
                                    address: addr.street,
                                    district: addr.district,
                                    reference: addr.reference,
                                  }));
                                }}
                              >
                                <strong>{addr.label}:</strong> {addr.street} ({addr.district})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="checkout-field-grid">
                        <label>
                          Dirección de entrega <span>*</span>
                          <input
                            required
                            minLength={5}
                            maxLength={160}
                            value={delivery.address}
                            placeholder="Av. Los Fresnos 123, Dpto 401"
                            onChange={e =>
                              setDelivery({ ...delivery, address: e.target.value })
                            }
                          />
                        </label>
                        <div className="delivery-district">
                          <label>
                            Distrito <span>*</span>
                          </label>
                          <select
                            required
                            value={delivery.district}
                            onChange={e =>
                              setDelivery({ ...delivery, district: e.target.value })
                            }
                          >
                            <option value="" disabled>
                              Selecciona tu distrito
                            </option>
                            <optgroup label="Lima Norte">
                              <option value="Carabayllo">Carabayllo</option>
                              <option value="Comas">Comas</option>
                              <option value="Independencia">Independencia</option>
                              <option value="Los Olivos">Los Olivos</option>
                              <option value="Puente Piedra">Puente Piedra</option>
                              <option value="San Martín de Porres">San Martín de Porres</option>
                              <option value="Ancón">Ancón</option>
                              <option value="Santa Rosa">Santa Rosa</option>
                            </optgroup>
                            <optgroup label="Otros distritos de Lima">
                              <option value="San Isidro">San Isidro</option>
                              <option value="Miraflores">Miraflores</option>
                              <option value="Santiago de Surco">Santiago de Surco</option>
                              <option value="San Borja">San Borja</option>
                              <option value="La Molina">La Molina</option>
                              <option value="Jesús María">Jesús María</option>
                              <option value="San Miguel">San Miguel</option>
                              <option value="Pueblo Libre">Pueblo Libre</option>
                              <option value="Cercado de Lima">Cercado de Lima</option>
                            </optgroup>
                          </select>
                        </div>
                        <label>
                          Referencia <span>*</span>
                          <input
                            required
                            minLength={3}
                            maxLength={160}
                            value={delivery.reference}
                            placeholder="Frente al parque, casa color blanco"
                            onChange={e =>
                              setDelivery({ ...delivery, reference: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Instrucciones de entrega (opcional)
                          <input
                            maxLength={300}
                            value={delivery.instructions}
                            placeholder="Ej. tocar la puerta, llamar antes…"
                            onChange={e =>
                              setDelivery({ ...delivery, instructions: e.target.value })
                            }
                          />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="checkout-store-field">
                      Selecciona el local
                      <select
                        value={delivery.store}
                        onChange={e => setDelivery({ ...delivery, store: e.target.value })}
                      >
                        <option value="Local Principal - Av. Túpac Amaru 3420, Comas">
                          Local Principal - Av. Túpac Amaru 3420, Comas
                        </option>
                        <option value="Local Los Olivos - Av. Antúnez de Mayolo 1280">
                          Local Los Olivos - Av. Antúnez de Mayolo 1280
                        </option>
                        <option value="Local San Martín - Av. Perú 2150">
                          Local San Martín - Av. Perú 2150
                        </option>
                      </select>
                    </label>
                  )}

                  <h2 className="checkout-field-heading">Datos de contacto</h2>
                  <div className="checkout-field-grid">
                    <label>
                      Nombre completo <span>*</span>
                      <input
                        autoComplete="name"
                        required
                        minLength={3}
                        maxLength={100}
                        value={delivery.name}
                        placeholder="Nombre y apellidos"
                        onChange={e => setDelivery({ ...delivery, name: e.target.value })}
                      />
                    </label>
                    <label>
                      Celular <span>*</span>
                      <input
                        type="tel"
                        autoComplete="tel-national"
                        required
                        pattern="9[0-9]{8}"
                        maxLength={9}
                        inputMode="numeric"
                        value={delivery.phone}
                        placeholder="987654321"
                        onChange={e =>
                          setDelivery({
                            ...delivery,
                            phone: e.target.value.replace(/\D/g, ''),
                          })
                        }
                      />
                    </label>
                    <label>
                      Correo electrónico <span>*</span>
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={120}
                        value={delivery.email}
                        placeholder="tu@correo.com"
                        onChange={e => setDelivery({ ...delivery, email: e.target.value })}
                      />
                    </label>
                  </div>

                  <div className="checkout-estimate">
                    <Icon name="clock" />
                    <div>
                      <span>
                        Tiempo estimado de {delivery.mode === 'delivery' ? 'entrega' : 'preparación'}
                      </span>
                      <strong>25 – 35 minutos</strong>
                      <small>Preparado al momento</small>
                    </div>
                    <Icon name="truck" />
                    <p>Tu pedido será preparado al momento con los mejores ingredientes</p>
                  </div>
                </form>
              </section>
            )}

            {/* Paso 2: Método de pago */}
            {step === 2 && (
              <section className="checkout-panel payment-step">
                <div className="checkout-section-heading">
                  <Icon name="card" />
                  <div>
                    <h1>Método de pago</h1>
                    <p>Selecciona cómo deseas pagar tu pedido.</p>
                  </div>
                </div>

                <fieldset>
                  <legend className="sr-only">Selecciona un método de pago</legend>
                  <div className="checkout-payment-methods">
                    {[
                      {
                        id: 'card',
                        name: 'Tarjeta',
                        description: 'Crédito o débito',
                        icon: 'card' as const,
                      },
                      {
                        id: 'yape',
                        name: 'Yape',
                        description: 'Paga desde tu app',
                        image: 'yape',
                      },
                      {
                        id: 'plin',
                        name: 'Plin',
                        description: 'Paga desde tu app',
                        image: 'plin',
                      },
                      {
                        id: 'cash',
                        name: 'Efectivo',
                        description: 'Paga al recibir',
                        icon: 'cash' as const,
                      },
                    ].map(option => (
                      <label
                        key={option.id}
                        className="checkout-choice"
                        data-selected={method === option.id}
                        data-method={option.id}
                      >
                        {'image' in option ? (
                          <img
                            src={`/images/checkout/${option.image}.webp`}
                            alt=""
                            width="56"
                            height="56"
                          />
                        ) : (
                          <Icon name={option.icon} />
                        )}
                        <span>
                          <strong>{option.name}</strong>
                          <small>{option.description}</small>
                        </span>
                        <input
                          type="radio"
                          name="payment-method"
                          checked={method === option.id}
                          value={option.id}
                          onChange={() => {
                            setMethod(option.id as PaymentMethod);
                            setErrorPago('');
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>

                <form id="payment-form" onSubmit={handlePaymentSubmit}>
                  {method === 'card' ? (
                    <div className="checkout-payment-details">
                      <div className="checkout-panel-heading">
                        <h2>Datos de la tarjeta</h2>
                        <span className="checkout-card-brands">
                          <b>VISA</b>
                          <i aria-label="Mastercard">
                            <span />
                            <span />
                          </i>
                          <small>
                            AMERICAN
                            <br />
                            EXPRESS
                          </small>
                        </span>
                      </div>
                      <div className="checkout-field-grid">
                        <label>
                          Nombre del titular <span>*</span>
                          <input
                            required
                            minLength={3}
                            maxLength={100}
                            placeholder="Nombre y apellidos"
                            defaultValue={delivery.name || 'Alexander Huamaní'}
                          />
                        </label>
                        <label>
                          Número de tarjeta <span>*</span>
                          <input
                            required
                            inputMode="numeric"
                            maxLength={19}
                            placeholder="4111 1111 1111 1111"
                            value={cardNumber}
                            onChange={e =>
                              setCardNumber(e.target.value.replace(/[^\d ]/g, ''))
                            }
                          />
                        </label>
                        <label>
                          Fecha de vencimiento <span>*</span>
                          <input
                            required
                            pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                            maxLength={5}
                            placeholder="MM/AA"
                            value={expiry}
                            onChange={e => setExpiry(e.target.value)}
                          />
                        </label>
                        <label>
                          CVV <span>*</span>
                          <input
                            required
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]{3,4}"
                            maxLength={4}
                            placeholder="123"
                            defaultValue="123"
                          />
                        </label>
                      </div>
                    </div>
                  ) : method === 'cash' ? (
                    <div className="checkout-payment-details">
                      <div className="checkout-section-heading">
                        <Icon name="cash" />
                        <div>
                          <h2>Pago en efectivo</h2>
                          <p>
                            Paga al recibir tu pedido. Indica con cuánto pagarás para calcular tu vuelto.
                          </p>
                        </div>
                      </div>
                      <div className="checkout-cash-calculator">
                        <div>
                          <span>Total a pagar</span>
                          <strong>{soles(totalFinal)}</strong>
                        </div>
                        <div>
                          <label>
                            ¿Con cuánto pagarás?
                            <input
                              type="number"
                              min={totalFinal}
                              step="0.10"
                              max="9999"
                              required={!exact}
                              disabled={exact}
                              value={exact ? totalFinal.toFixed(2) : cashAmount}
                              onChange={e => setCashAmount(e.target.value)}
                              placeholder="100.00"
                            />
                          </label>
                          <label className="checkout-billing-toggle">
                            <input
                              type="checkbox"
                              checked={exact}
                              onChange={e => setExact(e.target.checked)}
                            />
                            Pagaré con monto exacto
                          </label>
                        </div>
                        <div className="checkout-change">
                          <span>Tu vuelto será</span>
                          <strong>
                            {soles(
                              Math.max(
                                0,
                                (exact ? totalFinal : Number(cashAmount) || totalFinal) - totalFinal
                              )
                            )}
                          </strong>
                        </div>
                      </div>
                      <p className="checkout-payment-note">
                        Ten listo tu pago en efectivo al momento de la entrega o recojo.
                      </p>
                    </div>
                  ) : (
                    <div className={`checkout-wallet checkout-wallet-${method}`}>
                      <div className="checkout-section-heading">
                        <img
                          src={`/images/checkout/${method}.webp`}
                          width="70"
                          height="70"
                          alt={method === 'yape' ? 'Yape' : 'Plin'}
                        />
                        <div>
                          <h2>Pago con {method === 'yape' ? 'Yape' : 'Plin'}</h2>
                          <p>Revisa los pasos para realizar tu pago desde la aplicación.</p>
                        </div>
                      </div>
                      <div className="checkout-wallet-content">
                        <figure>
                          <div className="checkout-qr">
                            <img
                              src={`/images/checkout/qr-${method}-demo.svg`}
                              alt={`QR de pago con ${method}`}
                              width="260"
                              height="260"
                            />
                            <img
                              className="checkout-qr-logo"
                              src={`/images/checkout/${method}.webp`}
                              alt=""
                              width="60"
                              height="60"
                            />
                          </div>
                          <figcaption>Escanea el código QR desde tu app</figcaption>
                        </figure>
                        <div>
                          <ol className="checkout-wallet-instructions">
                            <li>
                              <b>Escanea el QR</b>
                              <span>Usa la aplicación oficial de {method === 'yape' ? 'Yape' : 'Plin'}.</span>
                            </li>
                            <li>
                              <b>Verifica el monto</b>
                              <span>Total a transferir: {soles(totalFinal)}.</span>
                            </li>
                            <li>
                              <b>Obtén tu código de aprobación</b>
                              <span>Copia los 6 dígitos que te brinda la constancia de pago.</span>
                            </li>
                          </ol>
                          <label>
                            {method === 'yape' ? 'Ingresa tu número de Yape' : 'Ingresa tu número de Plin'} <span>*</span>
                            <input
                              required
                              type="tel"
                              inputMode="numeric"
                              pattern="9[0-9]{8}"
                              maxLength={9}
                              placeholder="987654321"
                              value={walletPhone}
                              onChange={e => setWalletPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                            />
                          </label>
                          <label>
                            Código de aprobación (6 dígitos) <span>*</span>
                            <input
                              required
                              inputMode="numeric"
                              pattern="[0-9]{6}"
                              maxLength={6}
                              placeholder="000000"
                              className="checkout-wallet-code"
                              value={approvalCode}
                              onChange={e => setApprovalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            />
                          </label>
                          <small>Ingresa los 6 dígitos numéricos emitidos por tu app bancaria.</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {errorPago && (
                    <p role="alert" className="checkout-form-error">
                      {errorPago}
                    </p>
                  )}
                </form>

                <div className="checkout-security">
                  <Icon name="shield" />
                  <div>
                    <strong>Transacción protegida</strong>
                    <p>Tus pagos se procesan de manera rápida y segura.</p>
                  </div>
                </div>
              </section>
            )}

            {/* Paso 3: Confirmación de pedido */}
            {step === 3 && (
              <div className="checkout-confirmation">
                <div className="checkout-section-heading">
                  <div>
                    <h1>Confirmación de pedido</h1>
                    <p>Revisa que toda la información sea correcta antes de finalizar tu pedido.</p>
                  </div>
                </div>

                <section className="checkout-panel">
                  <div className="checkout-panel-heading">
                    <h2>1. Revisa tu información</h2>
                    <button
                      className="checkout-text-button"
                      type="button"
                      onClick={() => setStep(1)}
                    >
                      Editar
                    </button>
                  </div>

                  <div className="checkout-review-grid">
                    <div>
                      <Icon name="pin" />
                      <h3>Dirección y entrega</h3>
                      <strong>
                        {delivery.mode === 'delivery' ? delivery.address : delivery.store}
                      </strong>
                      <p>{delivery.mode === 'delivery' ? delivery.district : 'Recojo en local'}</p>
                      <p>Referencia: {delivery.reference || 'No aplica'}</p>
                      <div className="checkout-review-delivery">
                        <Icon name="truck" />
                        {delivery.mode === 'delivery' ? 'Delivery' : 'Recojo'} · 25 – 35 min
                      </div>
                    </div>

                    <div>
                      <Icon name="card" />
                      <h3>Método de pago</h3>
                      <strong>
                        {
                          {
                            card: 'Tarjeta de crédito/débito',
                            yape: 'Yape',
                            plin: 'Plin',
                            cash: 'Efectivo al recibir',
                          }[method]
                        }
                      </strong>
                      <p>
                        {method === 'cash'
                          ? 'Pago en efectivo al recibir'
                          : 'Pago digital verificado'}
                      </p>
                      <button
                        className="checkout-text-button"
                        type="button"
                        onClick={() => setStep(2)}
                      >
                        Cambiar método
                      </button>
                    </div>

                    <div>
                      <Icon name="receipt" />
                      <h3>Datos adicionales</h3>
                      <strong>Notas del pedido</strong>
                      <p>{delivery.instructions || 'Sin instrucciones adicionales'}</p>
                      <strong>Número de contacto</strong>
                      <p>{delivery.phone}</p>
                      <strong>{delivery.name}</strong>
                      <p>{delivery.email}</p>
                    </div>
                  </div>
                </section>

                <section className="checkout-panel">
                  <h2>2. Revisa tu pedido</h2>
                  <ul className="checkout-summary-items">
                    {items.map(item => (
                      <li key={item.productoId}>
                        <img src={item.imagen} alt="" width="88" height="72" />
                        <div>
                          <strong>{item.nombre}</strong>
                          <small>
                            {item.cantidad} × {soles(item.precioUnitario)}
                          </small>
                        </div>
                        <b>{soles(item.precioUnitario * item.cantidad)}</b>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}

            {/* Botón Volver para pasos > 0 */}
            {step > 0 && (
              <button
                type="button"
                className="checkout-outline checkout-back"
                onClick={() => {
                  setStep(step - 1);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                ← Volver
              </button>
            )}
          </div>

          {/* Columna lateral: Resumen del pedido */}
          <aside
            className="checkout-panel checkout-summary"
            aria-labelledby="order-summary-title"
          >
            <div className="checkout-panel-heading">
              <h2 id="order-summary-title">
                <Icon name="receipt" />
                Resumen del pedido
              </h2>
              {step > 0 && (
                <button
                  className="checkout-text-button"
                  type="button"
                  onClick={() => setStep(0)}
                >
                  Editar carrito
                </button>
              )}
            </div>

            {step > 0 && (
              <ul className="checkout-summary-items">
                {items.map(item => (
                  <li key={item.productoId}>
                    <img src={item.imagen} alt="" width="88" height="72" />
                    <div>
                      <strong>{item.nombre}</strong>
                      <small>
                        {item.cantidad} × {soles(item.precioUnitario)}
                      </small>
                    </div>
                    <b>{soles(item.precioUnitario * item.cantidad)}</b>
                  </li>
                ))}
              </ul>
            )}

            <div className="checkout-totals">
              <p>
                <span>Subtotal</span>
                <strong>{soles(total)}</strong>
              </p>
              <p>
                <span>Costo de envío</span>
                <strong>{soles(shippingCost)}</strong>
              </p>
              <p className="checkout-total">
                <b>Total</b>
                <strong>{soles(totalFinal)}</strong>
              </p>
            </div>

            {/* Botones independientes por paso para evitar envíos de formulario involuntarios */}
            {step === 0 && (
              <button
                key="btn-step-0"
                className="primary-button checkout-continue"
                type="button"
                disabled={!items.length}
                onClick={() => {
                  if (!user) {
                    localStorage.setItem('lys-return-after-login', '/carrito');
                    alNavegar('/iniciar-sesion');
                    return;
                  }
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              >
                {user ? 'Continuar compra' : 'Iniciar sesión para comprar'} <Icon name="arrow" />
              </button>
            )}

            {step === 1 && (
              <button
                key="btn-step-1"
                className="primary-button checkout-continue"
                type="submit"
                form="delivery-form"
              >
                Continuar al pago <Icon name="arrow" />
              </button>
            )}

            {step === 2 && (
              <button
                key="btn-step-2"
                className="primary-button checkout-continue"
                type="submit"
                form="payment-form"
              >
                Revisar pedido <Icon name="arrow" />
              </button>
            )}

            {step === 3 && (
              <button
                key="btn-step-3"
                className="primary-button checkout-continue"
                type="button"
                onClick={handleConfirmOrder}
                disabled={sending}
              >
                {sending ? 'Registrando pedido…' : 'Confirmar pedido'} <Icon name="arrow" />
              </button>
            )}

            {step === 3 && errorPago && <p role="alert" className="checkout-form-error">{errorPago}</p>}
            <p className="checkout-safe">
              <Icon name="shield" />
              Compra 100% segura y garantizada
            </p>
          </aside>
        </div>

        {/* Recomendaciones adicionales solo en el paso 0 */}
        {step === 0 && (
          <section className="cart-recommendations" aria-labelledby="recommendations-title">
            <div className="checkout-panel-heading">
              <h2 id="recommendations-title">
                <Icon name="flame" />
                Añade algo más
              </h2>
              <button
                className="checkout-text-button"
                type="button"
                onClick={() => alNavegar('/carta')}
              >
                Ver más productos <Icon name="arrow" />
              </button>
            </div>
            <div>
              {suggestions.map(product => (
                <article key={product.id}>
                  <img src={product.image} alt={product.name} width="160" height="120" />
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <strong>{soles(product.price)}</strong>
                    <button
                      className="checkout-outline"
                      type="button"
                      onClick={() => agregar(product.id, 1)}
                      aria-label={`Agregar ${product.name}`}
                    >
                      + Agregar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
