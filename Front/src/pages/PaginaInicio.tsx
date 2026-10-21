import { HeroInicio } from '../components/inicio/HeroInicio';
import { BeneficiosInicio } from '../components/inicio/BeneficiosInicio';
import { CatalogoInicio } from '../components/inicio/CatalogoInicio';
import '../styles/home.css';

interface PropiedadesPaginaInicio {
  alNavegar: (ruta: string) => void;
}

export function PaginaInicio({ alNavegar }: PropiedadesPaginaInicio) {
  return (
    <main id="contenido" className="home-page">
      <HeroInicio alNavegar={alNavegar} />
      <BeneficiosInicio />
      <CatalogoInicio alNavegar={alNavegar} />
    </main>
  );
}
