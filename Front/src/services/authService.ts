import { apiRequest, clearCsrf, googleAuthorizationUrl } from './api';
import { acceptSession, type SessionUser } from './session';
export type Credentials = { email: string; password: string; remember: boolean };
export type AuthResult = { ok: false; message: string; reason?: 'unavailable' } | { ok: true };
export interface AuthService { signIn(credentials: Credentials): Promise<AuthResult>; signInWithGoogle(): Promise<AuthResult>; }
export const authService: AuthService = {
 async signIn(credentials) {
  try { const user = await apiRequest<SessionUser>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }); clearCsrf(); await acceptSession(user); window.dispatchEvent(new Event('lys-login-success')); return { ok: true }; }
  catch(error) { return { ok: false, message: error instanceof Error ? error.message : 'No se pudo iniciar sesión.' }; }
 },
 async signInWithGoogle() {
  try {
   const config = await apiRequest<{enabled: boolean}>('/auth/google');
   if (!config.enabled) return { ok: false, reason: 'unavailable', message: 'El acceso con Google aún no está configurado en el servidor.' };
   location.assign(googleAuthorizationUrl());
   return { ok: true };
  } catch(error) { return { ok: false, message: error instanceof Error ? error.message : 'No se pudo conectar con Google.' }; }
 },
};
export async function changePassword(previous: string, next: string) { await apiRequest('/auth/password', { method: 'POST', body: JSON.stringify({ previous, next }) }); window.dispatchEvent(new Event('lys-session-expired')); }

export async function linkGoogle() { await apiRequest('/auth/google/link', { method: 'POST' }); location.assign(googleAuthorizationUrl()); }
