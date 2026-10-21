import { apiRequest } from '../../services/api';
import { useSyncExternalStore } from 'react';
export type AccountProfile = {
  photo?: string;
  name: string;
  email: string;
  phone: string;
  documentType: string;
  document: string;
  birthday: string;
  gender: string;
  notes: string;
};
export type AccountAddress = {
  id: string;
  label: string;
  street: string;
  district: string;
  reference: string;
  primary: boolean;
};
export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  expiry: string;
  primary: boolean;
};
export type AccountState = {
  cards: SavedCard[];
  profile: AccountProfile;
  addresses: AccountAddress[];
  preferredPayment: string;
  preferences: Record<string, boolean>;
  readNotifications: string[];
};

const initial = (): AccountState => ({
 profile: { name: '', email: '', phone: '', documentType: 'DNI', document: '', birthday: '', gender: '', notes: '' },
 cards: [], addresses: [], preferredPayment: '', preferences: {}, readNotifications: [],
});
let state = initial();
let feedback = { saving: false, error: '' };
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export async function loadAccount() { state = await apiRequest<AccountState>('/account'); feedback = { saving: false, error: '' }; notify(); }
export function clearAccount() { state = initial(); feedback = { saving: false, error: '' }; notify(); }
export async function updateAccount(patch: Partial<AccountState>): Promise<boolean> {
 if (feedback.saving) return false;
 feedback = { saving: true, error: '' }; notify();
 try { state = await apiRequest<AccountState>('/account', { method: 'PUT', body: JSON.stringify({ ...state, ...patch }) }); feedback = { saving: false, error: '' }; notify(); window.dispatchEvent(new Event('lys-profile-updated')); return true; }
 catch(error) { feedback = { saving: false, error: error instanceof Error ? error.message : 'No se pudo guardar.' }; notify(); return false; }
}
export function useAccount() { return useSyncExternalStore(subscribe, () => state); }
export function useAccountFeedback() { return useSyncExternalStore(subscribe, () => feedback); }
