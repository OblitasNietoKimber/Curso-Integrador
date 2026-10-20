import { useState, type FormEvent } from 'react';
import { AuthField } from './AuthField';
import { Icon } from '../../components/Icon';

export function RecoveryCard({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState('');
  const [reviewed, setReviewed] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = event.currentTarget.elements.namedItem('recovery-email') as HTMLInputElement;
    if (!email.validity.valid) { setError('Ingresa un correo electrónico válido.'); email.focus(); return; }
    setError(''); setReviewed(true);
  }
  return <section className="sign-in-card compact-auth-card recovery-card" aria-labelledby="recovery-title">
    <header className="auth-heading"><h2 id="recovery-title">Recupera tu contraseña</h2><p className="auth-description">Ingresa el correo asociado a tu cuenta.</p></header>
    <form onSubmit={submit} noValidate>
      <AuthField id="recovery-email" name="recovery-email" label="Correo electrónico" icon="mail" type="email" required autoComplete="email" placeholder="Tu correo electrónico" error={error} onChange={() => { setError(''); setReviewed(false); }} />
      <button className="primary-button sign-in-button" type="submit">Solicitar enlace <Icon name="arrow" /></button>
    </form>
    {reviewed && <p className="auth-message" role="status">Vista previa: el correo es válido. El envío del enlace estará disponible al conectar el servicio de recuperación. No se ha enviado ningún correo.</p>}
    <div className="register-divider"><button className="text-link" type="button" onClick={onLogin}>Volver a iniciar sesión</button></div>
  </section>;
}
