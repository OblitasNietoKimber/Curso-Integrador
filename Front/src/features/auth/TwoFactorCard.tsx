import { useState } from 'react';
import { apiRequest, clearCsrf } from '../../services/api';
import { acceptSession, type SessionUser } from '../../services/session';

export function TwoFactorCard() {
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  return <section className="sign-in-card compact-auth-card login-card" aria-labelledby="two-factor-title">
    <header className="auth-heading"><h2 id="two-factor-title">Verifica tu identidad</h2><p className="auth-description">Ingresa el código de Google Authenticator para completar el inicio de sesión.</p></header>
    <form className="account-form" aria-busy={pending} onSubmit={event => { event.preventDefault(); setPending(true); setError(''); void apiRequest<SessionUser>('/auth/2fa/verify', {method: 'POST', body: JSON.stringify({code})}).then(async user => { clearCsrf(); await acceptSession(user); window.dispatchEvent(new Event('lys-login-success')); }).catch(e => setError(e.message)).finally(() => setPending(false)); }}>
      <label>Código de verificación o recuperación<input autoFocus autoComplete="one-time-code" name="code" required pattern="[0-9]{6}|[0-9a-f]{16}" maxLength={16} value={code} disabled={pending} onChange={e => setCode(e.target.value.trim())} /></label>
      <p>También puedes usar uno de los códigos de recuperación que guardaste al activar la verificación.</p>
      {error && <p className="auth-message error" role="alert">{error}</p>}
      <button className="primary-button" disabled={pending}>{pending ? 'Verificando…' : 'Verificar e ingresar'}</button>
      <a className="text-link" href="/iniciar-sesion">Volver al inicio de sesión</a>
    </form>
  </section>;
}
