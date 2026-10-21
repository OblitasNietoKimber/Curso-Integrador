import { useState, useEffect, useCallback } from 'react';
import { BarraNavegacion } from './components/BarraNavegacion';
import { NavegacionInferior } from './components/NavegacionInferior';
import { PiePagina } from './components/PiePagina';
import { PaginaInicio } from './pages/PaginaInicio';
import { PaginaCatalogo } from './pages/PaginaCatalogo';
import { PaginaPromociones } from './pages/PaginaPromociones';
import { PaginaCarrito } from './pages/PaginaCarrito';
import './styles/global.css';
import './styles/tokens.css';

export default function App() {
  const [ruta, setRuta] = useState(() => window.location.pathname);
  const [consultaBusqueda, setConsultaBusqueda] = useState('');

  const navegarA = useCallback((nuevaRuta: string) => {
    window.history.pushState(null, '', nuevaRuta);
    setRuta(nuevaRuta.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const alCambiarRuta = () => setRuta(window.location.pathname);
    window.addEventListener('popstate', alCambiarRuta);
    return () => window.removeEventListener('popstate', alCambiarRuta);
  }, []);

  // Determinar la sección activa
  let seccionActiva = 'Inicio';
  if (ruta === '/carta') seccionActiva = 'Carta';
  else if (ruta === '/promociones') seccionActiva = 'Promociones';
  else if (ruta === '/carrito') seccionActiva = 'Carrito';

  // Configuración de título del documento
  useEffect(() => {
    const titulos: Record<string, string> = {
      '/': 'Leñas y Sabores | Sabor peruano en cada brasa',
      '/carta': 'Nuestra Carta | Leñas y Sabores',
      '/promociones': 'Promociones Especiales | Leñas y Sabores',
      '/carrito': 'Carrito de Compras | Leñas y Sabores',
    };
    document.title = titulos[ruta] || 'Leñas y Sabores';
  }, [ruta]);

  return (
    <div className="contenedor-aplicacion">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      {/* Barra de Navegación Principal */}
      <BarraNavegacion
        seccionActiva={seccionActiva}
        alNavegar={navegarA}
        busqueda={{
          consulta: consultaBusqueda,
          alBuscar: texto => {
            setConsultaBusqueda(texto);
            if (ruta !== '/carta') {
              navegarA(`/carta?buscar=${encodeURIComponent(texto)}`);
            }
          },
        }}
      />

      {/* Vistas Principales */}
      {ruta === '/carta' && (
        <PaginaCatalogo alNavegar={navegarA} consultaInicial={consultaBusqueda} />
      )}
      {ruta === '/promociones' && <PaginaPromociones />}
      {ruta === '/carrito' && <PaginaCarrito alNavegar={navegarA} />}
      {ruta !== '/carta' && ruta !== '/promociones' && ruta !== '/carrito' && (
        <PaginaInicio alNavegar={navegarA} />
      )}

      {/* Pie de Página */}
      <PiePagina alNavegar={navegarA} />

      {/* Barra de Navegación Móvil Inferior */}
      <NavegacionInferior activa={seccionActiva} alNavegar={navegarA} />
    </div>
  );
}
