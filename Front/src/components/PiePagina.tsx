import { Icono } from './Icono';

interface PropiedadesPiePagina {
  alNavegar: (ruta: string) => void;
}

const enlacesRapidos = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Carta', ruta: '/carta' },
  { nombre: 'Promociones', ruta: '/promociones' },
  { nombre: 'Carrito de compras', ruta: '/carrito' },
];

export function PiePagina({ alNavegar }: PropiedadesPiePagina) {
  return (
    <footer className="home-footer" id="pie-pagina">
      <div className="home-container">
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <defs>
            <filter id="footer-logo-color" colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 1 -1 0 0 0 1 -1 0 0 0 1 0 0 0 1 0"
              />
            </filter>
          </defs>
        </svg>

        <div className="footer-main">
          <a
            className="footer-logo"
            href="/"
            aria-label="Leñas y Sabores, inicio"
            onClick={e => {
              e.preventDefault();
              alNavegar('/');
            }}
          >
            <img
              src="/images/logo.webp"
              alt="Leñas y Sabores — Pollos & Parrillas"
              width="2048"
              height="682"
              loading="lazy"
            />
          </a>

          <nav aria-label="Enlaces rápidos">
            <h3>Enlaces rápidos</h3>
            <div>
              {enlacesRapidos.map(item => (
                <button
                  type="button"
                  key={item.nombre}
                  onClick={() => alNavegar(item.ruta)}
                >
                  {item.nombre}
                </button>
              ))}
            </div>
          </nav>

          <div className="footer-contact">
            <h3>Atención al cliente</h3>
            <p className="footer-contact-item">
              <Icono name="phone" /> +51 (01) 719-2020
            </p>
            <p className="footer-contact-item">
              <Icono name="pin" /> Av. Los Conquistadores 450, Lima, Perú
            </p>
            <p className="footer-contact-item">
              <Icono name="clock" /> Lunes a Domingo: 12:00 m. a 11:00 p.m.
            </p>
          </div>

          <div className="footer-social">
            <h3>Síguenos</h3>
            <div className="social-links">
              <span className="social-pill">Facebook</span>
              <span className="social-pill">Instagram</span>
              <span className="social-pill">TikTok</span>
            </div>
          </div>

          <p className="footer-phrase home-script">
            Más que una comida,<br />una tradición peruana
          </p>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Leñas y Sabores. Todos los derechos reservados.
          </span>
          <span>
            Sabor peruano, en cada brasa.{' '}
            <span className="peru-flag" aria-label="Bandera del Perú" role="img">
              🇵🇪
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
