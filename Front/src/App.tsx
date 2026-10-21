import { useState, useEffect, useCallback } from 'react';
import { BarraNavegacion } from './components/BarraNavegacion';
import { NavegacionInferior } from './components/NavegacionInferior';
import { PiePagina } from './components/PiePagina';
import { PaginaInicio } from './pages/PaginaInicio';
import { PaginaCatalogo } from './pages/PaginaCatalogo';
import { PaginaPromociones } from './pages/PaginaPromociones';
import { PaginaCarrito } from './pages/PaginaCarrito';

export default function App() {
  const [ruta, setRuta] = useState(() => window.location.pathname);
  const [consultaBusqueda, setConsultaBusqueda] = useState('');

  const navegarA = useCallback((nuevaRuta: string) => {
    window.history.pushState(null, '', nuevaRuta);
    setRuta(nuevaRuta.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const alCambiarRuta = () => setRuta(window.location.pathname);
    window.addEventListener('popstate', alCambiarRuta);
    return () => window.removeEventListener('popstate', alCambiarRuta);
  }, []);

  let seccionActiva = 'Inicio';
  if (ruta === '/carta') seccionActiva = 'Carta';
  else if (ruta === '/promociones') seccionActiva = 'Promociones';
  else if (ruta === '/carrito') seccionActiva = 'Carrito';

  useEffect(() => {
    const titulos: Record<string, string> = {
      '/': 'Leñas y Sabores | Sabor peruano en cada brasa',
      '/carta': 'Nuestra carta | Leñas y Sabores',
      '/promociones': 'Promociones | Leñas y Sabores',
      '/carrito': 'Tu pedido | Leñas y Sabores',
    };
    document.title = titulos[ruta] || 'Leñas y Sabores';
  }, [ruta]);

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

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

      {ruta === '/carta' && (
        <PaginaCatalogo alNavegar={navegarA} consultaInicial={consultaBusqueda} />
      )}
      {ruta === '/promociones' && <PaginaPromociones />}
      {ruta === '/carrito' && <PaginaCarrito alNavegar={navegarA} />}
      {ruta !== '/carta' && ruta !== '/promociones' && ruta !== '/carrito' && (
        <PaginaInicio alNavegar={navegarA} />
      )}

      <PiePagina alNavegar={navegarA} />
      <NavegacionInferior activa={seccionActiva} alNavegar={navegarA} />
    </>
  );
}
