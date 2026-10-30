import type { ReactNode } from 'react';

export function AuthLayout({ registration = false, children }: { registration?: boolean; children: ReactNode }) {
  return <main className={`sign-in-page${registration ? ' register-page' : ''}`} id="contenido">
    <picture className="hero-background" aria-hidden="true">
      <source media="(max-width: 900px), (max-width: 1150px) and (max-aspect-ratio: 3/4)" srcSet="/images/hero-mobile.webp" />
      <img src="/images/hero-desktop.webp" alt="" width="1672" height="941" fetchPriority="high" />
    </picture>
    <div className="hero-layout">
      <section className="welcome" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <h1 id="welcome-title"><span className="sr-only">{registration ? 'Únete al sabor de casa' : 'Bienvenido al sabor de casa'}</span><img className="welcome-lettering" width={registration ? 2020 : 2172} height={registration ? 778 : 724} src={registration ? '/images/register-lettering.webp' : '/images/welcome-lettering.webp'} alt="" aria-hidden="true" /></h1>
          {registration
            ? <p className="registration-caption">Crea tu cuenta y disfruta de nuestros deliciosos pollos a la brasa, promociones exclusivas y pedidos más rápidos.</p>
            : <p><span>Más que un pollo a la brasa,</span><span>es una tradición que nos une.</span></p>}
        </div>
      </section>
      {children}
    </div>
  </main>;
}
