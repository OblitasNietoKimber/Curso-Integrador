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
  const step = pedido.pagado ? 3 : ['Listo', 'En camino', 'Entregado'].includes(pedido.estado || '') ? 2 : pedido.estado === 'En preparación' ? 1 : 0;
  return <section className="pedido-progress" aria-label="Seguimiento del pedido">
    <div><strong>Estado de tu pedido</strong><span role="status">{['Recibido en Cocina', 'En preparación', 'Listo · pendiente de cobro en Caja', 'Cobrado'][step]}</span></div>
    <ol>{['Recibido', 'En preparación', 'Listo para Caja', 'Cobrado'].map((label, i) => <li key={label} data-complete={i <= step} aria-current={i === step ? 'step' : undefined}><span>{i < step ? '✓' : i + 1}</span>{label}</li>)}</ol>
    {error && <small role="status">{error}</small>}
  </section>;
}
