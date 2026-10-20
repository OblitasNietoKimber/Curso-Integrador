// Adaptador visual: sustituir por la API de Spring Boot al integrar autenticación.
export type Credentials = { email: string; password: string; remember: boolean };
export type AuthResult = { ok: false; message: string; reason?: 'unavailable' } | { ok: true };
export interface AuthService { signIn(credentials: Credentials): Promise<AuthResult>; signInWithGoogle(): Promise<AuthResult>; }
export const authService: AuthService = {
  async signIn() { return { ok: false, reason: 'unavailable', message: 'Vista previa: el inicio de sesión estará disponible al conectar el servicio de autenticación.' }; },
  async signInWithGoogle() { return { ok: false, reason: 'unavailable', message: 'El acceso con Google todavía no está disponible.' }; },
};
