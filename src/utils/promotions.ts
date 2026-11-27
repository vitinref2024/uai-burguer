import { COMBOS, STORE_CONFIG, getProductById } from '../data/menu';
import { CartItem, MenuProduct } from '../types/menu';

/**
 * Data oficial da promoção Black Friday (fuso America/Sao_Paulo).
 * Válida exclusivamente em 27/11/2026.
 */
export const BLACK_FRIDAY_DATE = '2026-11-27';
export const BLACK_FRIDAY_COMBO_PRICE = 49.99;

export const BLACK_FRIDAY_COMBO_IDS = [
  'combo-chesse-burger',
  'combo-onions-burger',
  'combo-classico',
] as const;

const BLACK_FRIDAY_COMBO_ID_SET = new Set<string>(BLACK_FRIDAY_COMBO_IDS);

/**
 * Retorna a data atual no formato YYYY-MM-DD no fuso oficial da loja (America/Sao_Paulo).
 */
export function getSaoPauloDateISO(now: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: STORE_CONFIG.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

/**
 * Indica se a promoção de Black Friday está ativa na data atual (27/11/2026).
 */
export function isBlackFridayActive(now: Date = new Date()): boolean {
  return getSaoPauloDateISO(now) === BLACK_FRIDAY_DATE;
}

/**
 * Verifica se o produto participa da oferta Black Friday.
 */
export function isBlackFridayComboId(productId: string): boolean {
  return BLACK_FRIDAY_COMBO_ID_SET.has(productId);
}

/**
 * Retorna os três combos já cadastrados que participam da Black Friday,
 * preservando os dados originais do cardápio sem duplicar produtos.
 */
export function getBlackFridayComboProducts(): MenuProduct[] {
  const byId = new Map(COMBOS.map((combo) => [combo.id, combo]));
  return BLACK_FRIDAY_COMBO_IDS.map((id) => byId.get(id)).filter(
    (combo): combo is MenuProduct => Boolean(combo && combo.available)
  );
}

/**
 * Retorna o preço efetivo do produto considerando a Black Friday em 27/11/2026.
 * Após essa data, retorna automaticamente o preço original do cardápio.
 */
export function getEffectiveProductPrice(
  product: Pick<MenuProduct, 'id' | 'price'>,
  now: Date = new Date()
): number {
  if (isBlackFridayActive(now) && isBlackFridayComboId(product.id)) {
    return BLACK_FRIDAY_COMBO_PRICE;
  }
  return product.price;
}

export interface ProductPromoInfo {
  isPromo: boolean;
  currentPrice: number;
  originalPrice?: number;
}

/**
 * Retorna informações promocionais de exibição/precificação para um produto.
 */
export function getProductPromoInfo(
  product: Pick<MenuProduct, 'id' | 'price'>,
  now: Date = new Date()
): ProductPromoInfo {
  if (isBlackFridayActive(now) && isBlackFridayComboId(product.id)) {
    return {
      isPromo: true,
      currentPrice: BLACK_FRIDAY_COMBO_PRICE,
      originalPrice: product.price,
    };
  }
  return {
    isPromo: false,
    currentPrice: product.price,
  };
}

/**
 * Sincroniza os preços base dos itens do carrinho com a vigência atual da promoção.
 * Garante que carrinhos salvos no localStorage atualizem para R$ 49,99 em 27/11/2026
 * e voltem automaticamente aos preços originais após essa data.
 */
export function syncCartItemsWithPromotions(
  items: CartItem[],
  now: Date = new Date()
): CartItem[] {
  let changed = false;
  const next = items.map((item) => {
    const product = getProductById(item.productId);
    if (!product) return item;
    const effectivePrice = getEffectiveProductPrice(product, now);
    if (item.basePrice === effectivePrice) return item;
    changed = true;
    return {
      ...item,
      basePrice: effectivePrice,
    };
  });

  return changed ? next : items;
}

/**
 * Ordena os combos para exibição no cardápio durante a Black Friday,
 * colocando os três combos promocionais em primeiro lugar sem alterar o catálogo original.
 */
export function sortCombosForDisplay(
  combos: MenuProduct[],
  now: Date = new Date()
): MenuProduct[] {
  if (!isBlackFridayActive(now)) return combos;

  const priorityMap = new Map<string, number>(
    BLACK_FRIDAY_COMBO_IDS.map((id, index) => [id, index])
  );

  return [...combos].sort((a, b) => {
    const aOrder = priorityMap.get(a.id);
    const bOrder = priorityMap.get(b.id);
    if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;
    return 0;
  });
}
