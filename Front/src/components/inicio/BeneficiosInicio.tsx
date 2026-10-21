import { Icono, type NombreIcono } from '../Icono';

interface Beneficio {
  icono: NombreIcono;
  titulo: string;
  descripcion: string;
}

const listaBeneficios: Beneficio[] = [
  { icono: 'truck', titulo: 'Delivery', descripcion: 'Tu sabor favorito en la comodidad de tu casa' },
  { icono: 'store', titulo: 'Recojo en local', descripcion: 'Rápido, caliente y sin esperas' },
  { icono: 'table', titulo: 'Consumo en salón', descripcion: 'Ven y vive la auténtica experiencia' },
  { icono: 'card', titulo: 'Pagos rápidos', descripcion: 'Efectivo, tarjetas y pagos digitales' },
  { icono: 'gift', titulo: 'Promociones exclusivas', descripcion: 'Más sabor para compartir con la familia' },
];

export function BeneficiosInicio() {
  return (
    <section className="service-benefits" aria-label="Servicios y beneficios">
      <div className="home-container">
        {listaBeneficios.map(b => (
          <div key={b.titulo} className="home-benefit">
            <Icono name={b.icono} />
            <div>
              <h3>{b.titulo}</h3>
              <p>{b.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
