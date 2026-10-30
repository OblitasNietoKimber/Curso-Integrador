import type { SessionUser } from './session';

export function destinoTrasLogin(user: Pick<SessionUser, 'role'> | null, requested: string | null) {
  if (!user) return '/iniciar-sesion';
  if (user.role === 'administrador') {
    if (requested === 'cocina') return '/cocina';
    if (requested === 'caja') return '/caja';
    if (requested === 'admin') return '/admin';
    return '/';
  }
  if (user.role === 'cocina' && requested === 'cocina') return '/cocina';
  if (user.role === 'caja' && requested === 'caja') return '/caja';
  return '/';
}
