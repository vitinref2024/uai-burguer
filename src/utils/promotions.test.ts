import test from 'node:test';
import assert from 'node:assert/strict';
import { BURGERS, COMBOS, DRINKS, SIDES, getProductById } from '../data/menu';
import { CartItem } from '../types/menu';
import { calculateCartSubtotal } from './pricing';
import {
  BLACK_FRIDAY_COMBO_IDS,
  BLACK_FRIDAY_COMBO_PRICE,
  getBlackFridayComboProducts,
  getEffectiveProductPrice,
  getProductPromoInfo,
  isBlackFridayActive,
  sortCombosForDisplay,
  syncCartItemsWithPromotions,
} from './promotions';
import { buildWhatsAppMessage } from './whatsapp';

test('Black Friday is active strictly on 2026-11-27 in America/Sao_Paulo and reverts automatically after', () => {
  // 2026-11-26 23:59 BRT = 2026-11-27T02:59:00Z -> NOT active
  assert.equal(isBlackFridayActive(new Date('2026-11-27T02:59:00Z')), false);

  // 2026-11-27 00:00 BRT = 2026-11-27T03:00:00Z -> ACTIVE
  assert.equal(isBlackFridayActive(new Date('2026-11-27T03:00:00Z')), true);

  // 2026-11-27 20:00 BRT = 2026-11-27T23:00:00Z -> ACTIVE
  assert.equal(isBlackFridayActive(new Date('2026-11-27T23:00:00Z')), true);

  // 2026-11-27 23:59 BRT = 2026-11-28T02:59:00Z -> ACTIVE
  assert.equal(isBlackFridayActive(new Date('2026-11-28T02:59:00Z')), true);

  // 2026-11-28 00:00 BRT = 2026-11-28T03:00:00Z -> EXPIRED
  assert.equal(isBlackFridayActive(new Date('2026-11-28T03:00:00Z')), false);
});

test('Black Friday applies R$ 49,99 only to the three target combos on 2026-11-27 and reverts after', () => {
  const duringPromo = new Date('2026-11-27T21:00:00Z'); // 18:00 BRT on 27/11/2026
  const afterPromo = new Date('2026-11-28T03:05:00Z'); // 00:05 BRT on 28/11/2026

  const promoCombos = getBlackFridayComboProducts();
  assert.deepEqual(
    promoCombos.map((c) => c.id),
    [...BLACK_FRIDAY_COMBO_IDS]
  );

  for (const id of BLACK_FRIDAY_COMBO_IDS) {
    const product = getProductById(id);
    assert.ok(product, `Missing combo ${id}`);
    assert.equal(getEffectiveProductPrice(product, duringPromo), BLACK_FRIDAY_COMBO_PRICE);
    const infoDuring = getProductPromoInfo(product, duringPromo);
    assert.equal(infoDuring.isPromo, true);
    assert.equal(infoDuring.currentPrice, 49.99);
    assert.equal(infoDuring.originalPrice, product.price);

    // After promo ends, original prices return automatically
    assert.equal(getEffectiveProductPrice(product, afterPromo), product.price);
    const infoAfter = getProductPromoInfo(product, afterPromo);
    assert.equal(infoAfter.isPromo, false);
    assert.equal(infoAfter.currentPrice, product.price);
  }

  // Other combos, burgers, sides, and drinks remain completely unchanged
  const nonPromoCombo = COMBOS.find((c) => c.id === 'combo-monster')!;
  assert.equal(getEffectiveProductPrice(nonPromoCombo, duringPromo), 58);

  const burger = BURGERS.find((b) => b.id === 'classico')!;
  assert.equal(getEffectiveProductPrice(burger, duringPromo), 35);

  assert.equal(getEffectiveProductPrice(SIDES[0], duringPromo), 12);
  assert.equal(getEffectiveProductPrice(DRINKS[0], duringPromo), 7);
});

test('cart sync, subtotal, and WhatsApp comanda reflect R$ 49,99 during Black Friday and revert after', () => {
  const duringPromo = new Date('2026-11-27T21:00:00Z');
  const afterPromo = new Date('2026-11-28T03:05:00Z');

  const cheeseCombo = getProductById('combo-chesse-burger')!;
  const onionsCombo = getProductById('combo-onions-burger')!;
  const classicoCombo = getProductById('combo-classico')!;
  const uaiCombo = getProductById('combo-uai-burguer')!;

  const staleCart: CartItem[] = [
    {
      cartItemId: 'c1',
      productId: cheeseCombo.id,
      name: cheeseCombo.name,
      category: cheeseCombo.category,
      basePrice: cheeseCombo.price,
      quantity: 1,
      removedIngredients: [],
      extras: [],
      sauces: [],
      observations: '',
    },
    {
      cartItemId: 'c2',
      productId: onionsCombo.id,
      name: onionsCombo.name,
      category: onionsCombo.category,
      basePrice: onionsCombo.price,
      quantity: 1,
      removedIngredients: [],
      extras: [],
      sauces: [],
      observations: '',
    },
    {
      cartItemId: 'c3',
      productId: classicoCombo.id,
      name: classicoCombo.name,
      category: classicoCombo.category,
      basePrice: classicoCombo.price,
      quantity: 1,
      removedIngredients: [],
      extras: [],
      sauces: [],
      observations: '',
    },
    {
      cartItemId: 'c4',
      productId: uaiCombo.id,
      name: uaiCombo.name,
      category: uaiCombo.category,
      basePrice: uaiCombo.price,
      quantity: 1,
      removedIngredients: [],
      extras: [],
      sauces: [],
      observations: '',
    },
  ];

  const promoCart = syncCartItemsWithPromotions(staleCart, duringPromo);
  // 49.99 * 3 + 69 = 218.97
  assert.equal(calculateCartSubtotal(promoCart), 218.97);

  const msg = buildWhatsAppMessage(promoCart, {
    orderType: 'retirada',
    customerName: 'Cliente Black Friday',
    customerPhone: '(16) 99999-9999',
    address: {
      cidade: '',
      bairro: '',
      rua: '',
      numero: '',
      complemento: '',
      referencia: '',
    },
    paymentMethod: 'pix',
    needsChange: false,
    changeFor: '',
  });
  assert.ok(msg.includes('1x Combo Chesse Burger — R$\u00A049,99'));
  assert.ok(msg.includes('1x Combo Onions Burger — R$\u00A049,99'));
  assert.ok(msg.includes('1x Combo Clássico — R$\u00A049,99'));
  assert.ok(msg.includes('1x Combo Uai Burguer — R$\u00A069,00'));
  assert.ok(msg.includes('SUBTOTAL DOS PRODUTOS: R$\u00A0218,97'));

  // After promo expires, prices revert automatically to 57 + 58 + 54 + 69 = 238
  const revertedCart = syncCartItemsWithPromotions(promoCart, afterPromo);
  assert.equal(calculateCartSubtotal(revertedCart), 238);
});

test('sortCombosForDisplay puts the 3 Black Friday combos first on 2026-11-27 without mutating COMBOS', () => {
  const duringPromo = new Date('2026-11-27T21:00:00Z');
  const afterPromo = new Date('2026-11-28T03:05:00Z');

  const sortedDuring = sortCombosForDisplay(COMBOS, duringPromo);
  assert.deepEqual(
    sortedDuring.slice(0, 3).map((c) => c.id),
    ['combo-chesse-burger', 'combo-onions-burger', 'combo-classico']
  );
  assert.equal(sortedDuring.length, COMBOS.length);

  // Original COMBOS array order untouched
  assert.equal(COMBOS[2].id, 'combo-monster');

  // After promo, order returns to original
  const sortedAfter = sortCombosForDisplay(COMBOS, afterPromo);
  assert.deepEqual(
    sortedAfter.map((c) => c.id),
    COMBOS.map((c) => c.id)
  );
});
