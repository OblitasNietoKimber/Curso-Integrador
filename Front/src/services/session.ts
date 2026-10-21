import { useSyncExternalStore } from 'react';
import { apiRequest, ApiError, clearCsrf } from './api';
import { loadAccount, clearAccount } from '../features/account/accountStore';
export type SessionUser = { id: string; name: string; email: string; phone: string; role: string };
let state: { user: SessionUser | null; loading: boolean; error: string } = { user: null, loading: true, error: '' };
const listeners = new Set<() => void>();
function publish(next: typeof state) { state = next; listeners.forEach(listener => listener()); }
export function useSession() { return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => state); }
export async function acceptSession(user: SessionUser) { if (user.role === 'cliente') await loadAccount(); else clearAccount(); publish({ user, loading: false, error: '' }); }
export async function refreshSession() {
  try { const user = await apiRequest<SessionUser>('/auth/me'); await acceptSession(user); }
  catch (error) { publish({ user: null, loading: false, error: error instanceof ApiError && error.status === 401 ? '' : 'No se pudo comprobar tu sesión. Inténtalo de nuevo.' }); }
}
export async function logout() { await apiRequest('/auth/logout', { method: 'POST' }); clearCsrf(); clearAccount(); publish({ user: null, loading: false, error: '' }); }
window.addEventListener('lys-session-expired', () => { clearCsrf(); clearAccount(); publish({ user: null, loading: false, error: '' }); });
