export const soles = (valor: number): string => `S/ ${valor.toFixed(2)}`;

export const normalizarTexto = (valor: string): string =>
  valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
