import { useState, useRef, useEffect } from 'react';
import { Icono } from '../Icono';

interface PropiedadesHeroInicio {
  alNavegar: (ruta: string) => void;
}

const diapositivas = [
  {
    primero: 'Sabor peruano',
    segundo: 'en cada brasa',
    descripcion: 'Auténtico pollo a la brasa, con el sabor de nuestra tierra y la tradición de siempre.',
    imagen: 'hero',
    alt: 'Pollo a la brasa con papas, ensalada, cremas e Inca Kola',
  },
  {
    primero: 'Comparte el fuego',
    segundo: 'de nuestra cocina',
    descripcion: 'Crujiente por fuera, jugoso por dentro y listo para disfrutar en cada momento.',
    imagen: 'hero-compartir',
    alt: 'Parrilla para compartir con papas, ensalada, cremas e Inca Kola',
  },
  {
    primero: 'Sabores peruanos',
    segundo: 'en cada momento',
    descripcion: 'Platos tradicionales, ingredientes frescos y el auténtico sabor a la brasa.',
    imagen: 'hero-tradicion',
    alt: 'Lomo saltado con papas, arroz chaufa, wantanes, cremas e Inca Kola',
  },
];

const INTERVALO_MS = 8000;

export function HeroInicio({ alNavegar }: PropiedadesHeroInicio) {
  const [actual, setActual] = useState(0);
  const [tocando, setTocando] = useState(false);
  const inicioX = useRef<number | null>(null);

  useEffect(() => {
    if (tocando) return;
    const temporizador = window.setTimeout(() => {
      setActual(indice => (indice + 1) % diapositivas.length);
    }, INTERVALO_MS);
    return () => window.clearTimeout(temporizador);
  }, [actual, tocando]);

  function mover(delta: number) {
    setActual(indice => (indice + delta + diapositivas.length) % diapositivas.length);
  }

  const diapositiva = diapositivas[actual];

  return (
    <section
      className={`home-hero ${actual === 1 ? 'home-hero-sharing' : actual === 2 ? 'home-hero-traditional' : ''}`}
      aria-roledescription="carrusel"
      aria-label="Sabores de nuestra cocina"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') mover(1);
        if (e.key === 'ArrowLeft') mover(-1);
      }}
      onTouchStart={e => {
        setTocando(true);
        inicioX.current = e.touches[0].clientX;
      }}
      onTouchEnd={e => {
        setTocando(false);
        if (inicioX.current === null) return;
        const distancia = e.changedTouches[0].clientX - inicioX.current;
        if (Math.abs(distancia) > 50) mover(distancia < 0 ? 1 : -1);
        inicioX.current = null;
      }}
    >
      <picture className={`home-hero-picture slide-${diapositiva.imagen}`}>
        {actual === 0 && <source media="(max-width: 650px)" srcSet="/images/home/hero-mobile.webp" />}
        {actual === 1 && <source media="(max-width: 650px)" srcSet="/images/home/hero-compartir-mobile.webp" />}
        {actual === 1 && <source media="(max-width: 1100px)" srcSet="/images/home/hero-compartir-tablet.webp" />}
        {actual === 2 && <source media="(max-width: 650px)" srcSet="/images/home/hero-tradicion-mobile.webp" />}
        <img
          src={`/images/home/${diapositiva.imagen}-2172.webp`}
          srcSet={`/images/home/${diapositiva.imagen}-1080.webp 1080w, /images/home/${diapositiva.imagen}-2172.webp 2172w`}
          sizes="100vw"
          alt={diapositiva.alt}
          width="2172"
          height="724"
          fetchPriority="high"
        />
      </picture>

      <div className="home-hero-inner home-container">
        <div className="home-hero-copy">
          <h1>
            <span className="sr-only">
              {diapositiva.primero} {diapositiva.segundo}
            </span>
            <img
              className="home-hero-title"
              src={`/images/home/${['title', 'title-compartir', 'title-tradicion'][actual]}.webp`}
              alt=""
              width="1400"
              height={[519, 468, 520][actual]}
            />
          </h1>
          <p>{diapositiva.descripcion}</p>
        </div>

        <div className="home-hero-actions">
          <button
            type="button"
            className="home-button"
            onClick={() => alNavegar('/carrito')}
          >
            <span className="order-glare" aria-hidden="true" />
            <Icono name="truck" />
            Pedir ahora
            <Icono name="arrow" />
          </button>
          <button
            type="button"
            className="home-button home-button-outline"
            onClick={() => alNavegar('/carta')}
          >
            <Icono name="cutlery" />
            {actual === 1 ? 'Descubre combos' : actual === 2 ? 'Ver nuestro menú' : 'Ver carta'}
          </button>
        </div>
      </div>

      <button
        className="carousel-arrow previous"
        type="button"
        aria-label="Diapositiva anterior"
        onClick={() => mover(-1)}
      >
        <Icono name="arrow" />
      </button>
      <button
        className="carousel-arrow next"
        type="button"
        aria-label="Diapositiva siguiente"
        onClick={() => mover(1)}
      >
        <Icono name="arrow" />
      </button>

      <div className="carousel-dots" aria-label="Elegir diapositiva">
        {diapositivas.map((item, index) => (
          <button
            type="button"
            key={item.imagen}
            aria-label={`Ver diapositiva ${index + 1}`}
            aria-pressed={actual === index}
            onClick={() => setActual(index)}
          >
            <span />
          </button>
        ))}
      </div>
    </section>
  );
}
