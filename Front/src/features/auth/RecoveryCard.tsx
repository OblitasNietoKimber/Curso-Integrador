import { useState, type FormEvent } from 'react';
import { AuthField } from './AuthField';
import { apiRequest } from '../../services/api';
import { Icon } from '../../components/Icon';

export function RecoveryCard({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = event.currentTarget.elements.namedItem('recovery-email') as HTMLInputElement;
    if (!email.validity.valid) { setError('Ingresa un correo electrónico válido.'); email.focus(); return; }
    setError(''); setMessage(''); setPending(true);
    try { const result = await apiRequest<{message: string}>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: email.value.trim() }) }); setMessage(result.message); } catch(error) { setError(error instanceof Error ? error.message : 'No se pudo enviar la solicitud.'); } finally { setPending(false); }
  }
  return <section className="sign-in-card compact-auth-card recovery-card" aria-labelledby="recovery-title">
    <header className="auth-heading"><h2 id="recovery-title">Recupera tu contraseña</h2><p className="auth-description">Ingresa el correo asociado a tu cuenta.</p></header>
    <form onSubmit={submit} noValidate>
      <AuthField id="recovery-email" name="recovery-email" label="Correo electrónico" icon="mail" type="email" required autoComplete="email" placeholder="Tu correo electrónico" error={error} onChange={() => { setError(''); setMessage(''); }} />
      <button className="primary-button sign-in-button" type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Solicitar enlace'} <Icon name="arrow" /></button>
    </form>
    {message && <p className="auth-message" role="status">{message}</p>}
    <div className="register-divider"><button className="text-link" type="button" onClick={onLogin}>Volver a iniciar sesión</button></div>
  </section>;
}
