export function formatPrice(price: number | string): string {
  const value = Math.round(Number(price) || 0);
  return `$ ${value.toLocaleString('es-CO')}`;
}