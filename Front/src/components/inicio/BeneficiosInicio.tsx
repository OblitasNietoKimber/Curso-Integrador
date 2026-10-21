import { Icon, type IconName } from '../Icon';

export type Benefit = { icon: IconName; title: string; description: string };

const serviceBenefits: Benefit[] = [
  { icon: 'truck', title: 'Delivery', description: 'Tu sabor favorito en casa' },
  { icon: 'store', title: 'Recojo en local', description: 'Rápido y sin esperas' },
  { icon: 'table', title: 'Consumo en mesa', description: 'Ven y vive la experiencia' },
  { icon: 'card', title: 'Pagos rápidos', description: 'Efectivo, tarjeta y Yape' },
  { icon: 'gift', title: 'Promociones exclusivas', description: 'Más sabor, más momentos' },
];

function BenefitItem({ item }: { item: Benefit }) {
  return (
    <div className="home-benefit">
      <Icon name={item.icon} />
      <div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </div>
  );
}

export function BeneficiosInicio() {
  return (
    <section className="service-benefits" aria-label="Servicios">
      <div className="home-container">
        {serviceBenefits.map(item => (
          <BenefitItem key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}
