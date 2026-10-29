const base = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
let csrf: Promise<{ token: string; headerName: string }> | undefined;
export function clearCsrf() { csrf = undefined; }
async function token() {
  csrf ??= fetch(base + '/auth/csrf', { credentials: 'include' }).then(async response => {
    if (!response.ok) throw new ApiError('No se pudo preparar la sesión.', response.status);
    return response.json();
  }).catch(error => { csrf = undefined; throw error; });
  return csrf;
}
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (!['GET','HEAD','OPTIONS'].includes((options.method || 'GET').toUpperCase())) { const value = await token(); headers.set(value.headerName, value.token); }
  let response: Response;
  try { response = await fetch(base + path, { ...options, credentials: 'include', headers }); }
  catch { throw new ApiError('No se pudo conectar con el servidor. Comprueba que Spring Boot esté iniciado.', 0); }
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('lys-session-expired'));
    if (response.status === 403) clearCsrf();
    const value = await response.json().catch(() => null);
    throw new ApiError(value?.message || 'No se pudo completar la solicitud.', response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export function googleAuthorizationUrl() { return new URL('/oauth2/authorization/google', new URL(base, location.origin)).toString(); }
