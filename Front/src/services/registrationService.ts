import type { AuthResult } from './authService';
export type Registration = { name: string; email: string; phone: string; password: string; termsAccepted: boolean };
export interface RegistrationService { register(values: Registration): Promise<AuthResult>; registerWithGoogle(): Promise<AuthResult>; }
export const registrationService: RegistrationService = {
  async register() { return { ok: false, reason: 'unavailable', message: 'Vista previa: tus datos son válidos. El registro estará disponible al conectar el servicio de autenticación.' }; },
  async registerWithGoogle() { return { ok: false, reason: 'unavailable', message: 'El registro con Google todavía no está disponible.' }; },
};
