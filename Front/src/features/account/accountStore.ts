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
  profile: { name: 'Cliente de ejemplo', email: 'cliente@example.com', phone: '987654321', documentType: 'DNI', document: '', birthday: '', gender: '', notes: '' },
  cards: [], addresses: [], preferredPayment: '',
  preferences: { email: true, orders: true, promotions: false, favorites: false, account: true }, readNotifications: [],
});
let state = initial();
const listeners = new Set<() => void>();
export function updateAccount(patch: Partial<AccountState>) { state = { ...state, ...patch }; listeners.forEach(listener => listener()); }
export function resetAccount() { state = initial(); listeners.forEach(listener => listener()); }
export function useAccount() { return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => state); }
