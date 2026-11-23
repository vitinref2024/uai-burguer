import { CartItem, SelectedOptionItem } from '../types/menu';

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calcula a soma de opções selecionadas (adicionais ou molhos),
 * considerando quantidades repetidas.
 */
export function calculateOptionsTotal(options: SelectedOptionItem[]): number {
  const sum = options.reduce((acc, item) => {
    const qty = Math.max(0, Math.floor(item.quantity));
    return acc + item.unitPrice * qty;
  }, 0);
  return roundMoney(sum);
}

/**
 * Calcula o preço unitário de um item (preço base + adicionais + molhos).
 * Retirar ingredientes nunca altera o preço original.
 */
export function calculateItemUnitPrice(item: {
  basePrice: number;
  extras: SelectedOptionItem[];
  sauces: SelectedOptionItem[];
}): number {
  const extrasTotal = calculateOptionsTotal(item.extras);
  const saucesTotal = calculateOptionsTotal(item.sauces);
  return roundMoney(item.basePrice + extrasTotal + saucesTotal);
}

/**
 * Calcula o subtotal de um item do carrinho multiplicado pela quantidade.
 */
export function calculateItemTotal(item: CartItem): number {
  const unitPrice = calculateItemUnitPrice(item);
  const qty = Math.max(1, Math.floor(item.quantity));
  return roundMoney(unitPrice * qty);
}

/**
 * Calcula o subtotal geral do carrinho considerando exclusivamente
 * os produtos, adicionais e molhos (NUNCA inclui taxa de entrega).
 */
export function calculateCartSubtotal(items: CartItem[]): number {
  const sum = items.reduce((acc, item) => acc + calculateItemTotal(item), 0);
  return roundMoney(sum);
}

/**
 * Calcula a quantidade total de unidades no carrinho.
 */
export function calculateCartItemCount(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + Math.max(0, Math.floor(item.quantity)), 0);
}
