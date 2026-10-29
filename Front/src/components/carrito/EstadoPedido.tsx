import { useEffect, useState } from 'react';
import { consultarPedido } from '../../services/pedidosApi';
import type { Pedido } from '../../services/cajaApi';
import '../../styles/estado-pedido.css';

export function EstadoPedido({ inicial }: { inicial: Pedido }) {
  const [pedido, setPedido] = useState(inicial);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let pending = false;
    const timer = setInterval(async () => {
      if (pending) return;
      pending = true;
      try {
        const result = await consultarPedido(inicial.id);
        if (active) { setPedido(result); setError(''); }
      } catch { if (active) setError('No pudimos actualizar el estado. Tu pedido sigue registrado.'); }
      finally { pending = false; }
    }, 10000);
    return () => { active = false; clearInterval(timer); };
  }, [inicial.id]);
  const step = ['Listo', 'En camino', 'Entregado'].includes(pedido.estado || '') ? 2 : pedido.estado === 'En preparación' ? 1 : 0;
  return <section className="pedido-progress" aria-label="Seguimiento del pedido">
    <div><strong>Estado de tu pedido</strong><span role="status">{['Recibido en Cocina', 'En preparación', pedido.pagado ? 'Listo · pago registrado' : 'Listo · pendiente de cobro en Caja'][step]}</span></div>
    <p className="pedido-payment" data-paid={pedido.pagado}>{pedido.pagado ? `Pagado${pedido.metodoPago ? ` con ${pedido.metodoPago}` : ''} · no requiere otro cobro` : 'Pago pendiente al recibir'}</p>
    <ol>{['Recibido', 'En preparación', 'Listo'].map((label, i) => <li key={label} data-complete={i <= step} aria-current={i === step ? 'step' : undefined}><span>{i < step ? '✓' : i + 1}</span>{label}</li>)}</ol>
    {error && <small role="status">{error}</small>}
  </section>;
}
