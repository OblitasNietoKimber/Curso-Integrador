import { authService, type AuthResult } from './authService';
import { apiRequest } from './api';
export type Registration = { name: string; email: string; phone: string; password: string; termsAccepted: boolean };
export interface RegistrationService { register(values: Registration): Promise<AuthResult>; registerWithGoogle(): Promise<AuthResult>; }
export const registrationService: RegistrationService = {
 async register(values) { try { await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(values) }); return authService.signIn({ email: values.email, password: values.password, remember: false }); } catch(error) { return { ok: false, message: error instanceof Error ? error.message : 'No se pudo crear la cuenta.' }; } },
 async registerWithGoogle() { return { ok: false, reason: 'unavailable', message: 'El registro con Google todavía no está disponible.' }; },
};
