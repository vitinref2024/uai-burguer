import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BURGERS,
  COMBOS,
  CUSTOM_BURGER_PRODUCT,
  DRINKS,
  EXTRAS,
  MENU_CATEGORIES,
  SAUCE_PRODUCTS,
  SAUCES,
  SIDES,
  STORE_CONFIG,
  getProductById,
} from '../data/menu';
import { CartItem, CheckoutFormData } from '../types/menu';
import {
  calculateCartItemCount,
  calculateCartSubtotal,
  calculateItemTotal,
  calculateItemUnitPrice,
} from './pricing';
import { getStoreStatus } from './schedule';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  buildWhatsAppUrlFromMessage,
  validateCheckout,
} from './whatsapp';
import { formatBRL, formatPhoneBR, parseBRLInput } from './format';

test('catalog integrity: burgers, combos, Monte do Seu Jeito, extras, sauces, sides, and drinks match exact prices', () => {
  assert.equal(BURGERS.length, 15);
  assert.equal(COMBOS.length, 14);
  assert.equal(EXTRAS.length, 19);
  assert.equal(SAUCES.length, 7);
  assert.equal(SIDES.length, 1);
  assert.equal(DRINKS.length, 8);

  // Spot check exact names and prices across the menu
  const byName = new Map(BURGERS.map((b) => [b.name, b]));
  assert.equal(byName.get('CARNE QUEIJO')?.price, 23);
  assert.equal(byName.get('SMACH BURGUER')?.price, 28);
  assert.equal(byName.get('TEXAS')?.price, 30);
  assert.deepEqual(byName.get('TEXAS')?.breadOptions, ['Pão de Brioche', 'Pão Australiano']);
  assert.equal(byName.get('AUSTIN')?.price, 34);
  assert.equal(byName.get('CLÁSSICO')?.price, 35);
  assert.equal(byName.get('MELT CHEDDAR')?.price, 37);
  assert.equal(byName.get('CHESSE BURGUER')?.price, 38);
  assert.equal(byName.get('MORANGUETTI')?.price, 38);
  assert.equal(byName.get('HOLLYWOOD')?.price, 38);
  assert.equal(byName.get('PINEAPLE BURGGUER')?.price, 38);
  assert.equal(byName.get('MONSTER')?.price, 39);
  assert.equal(byName.get('ONIOS BURGUER')?.price, 39);
  assert.equal(byName.get('DALLA´S BURGUER')?.price, 39);
  assert.equal(byName.get('AMERICAN BURGUER')?.price, 39);
  assert.equal(byName.get('UAI BURGUER')?.price, 50);

  const expectedCombos = [
    ['Combo Chesse Burger', 57],
    ['Combo Onions Burger', 58],
    ['Combo Monster', 58],
    ['Combo Texas', 48],
    ['Combo Hollywood', 57],
    ['Combo Pineapple Burguer', 56],
    ['Combo Dallas Burguer', 58],
    ['Combo Uai Burguer', 69],
    ['Combo Clássico', 54],
    ['Combo Melt Cheadder', 54],
    ['Combo Morangueti', 57],
    ['Combo Austin', 54],
    ['Combo Smach Burger', 46],
    ['Combo American Burguer', 59],
  ] as const;
  assert.deepEqual(
    COMBOS.map(({ name, price }) => [name, price]),
    expectedCombos
  );
  assert.ok(MENU_CATEGORIES.some((category) => category.id === 'combos'));
  assert.ok(
    COMBOS.every(
      (combo) =>
        combo.category === 'combos' &&
        combo.description?.includes('batata frita (~100 g)') &&
        combo.description.includes('Coca-Cola lata de 350 ml')
    )
  );
  assert.equal(getProductById(COMBOS[0].id), COMBOS[0]);

  // Monte do Seu Jeito
  assert.equal(CUSTOM_BURGER_PRODUCT.price, 23);
  assert.deepEqual(CUSTOM_BURGER_PRODUCT.breadOptions, ['Pão de Brioche', 'Pão Gergelim']);
  assert.equal(CUSTOM_BURGER_PRODUCT.allowsMeatDoneness, true);

  // Only Monte do Seu Jeito has meat doneness; only TEXAS and Monte do Seu Jeito have bread options
  for (const burger of BURGERS) {
    assert.notEqual(burger.allowsMeatDoneness, true);
    if (burger.id !== 'texas') {
      assert.equal(burger.breadOptions, undefined);
    }
  }

  // Sides & Drinks
  assert.equal(SIDES[0].name, 'Batata Frita 110g');
  assert.equal(SIDES[0].price, 12);
  const cocaZero = DRINKS.find((d) => d.name === 'Coca-Cola Zero Lata 350ml');
  assert.equal(cocaZero?.price, 7.5);
  const coca25 = DRINKS.find((d) => d.name === 'Coca-Cola 2,5 L');
  assert.equal(coca25?.price, 17);
  const limoneto = DRINKS.find((d) => d.name === 'Limoneto 1,5 LT');
  assert.equal(limoneto?.price, 8);
});

test('combos calculate in the cart and include their composition in WhatsApp orders', () => {
  const combo = COMBOS[0];
  const cartItem: CartItem = {
    cartItemId: 'combo-test',
    productId: combo.id,
    name: combo.name,
    category: combo.category,
    basePrice: combo.price,
    quantity: 1,
    removedIngredients: [],
    extras: [],
    sauces: [],
    observations: '',
  };

  assert.equal(calculateCartSubtotal([cartItem]), 57);
  assert.equal(calculateCartItemCount([cartItem]), 1);

  const message = buildWhatsAppMessage([cartItem], {
    orderType: 'retirada',
    customerName: 'Cliente Teste',
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
  assert.ok(message.includes('1x Combo Chesse Burger — R$\u00A057,00'));
  assert.ok(combo.description);
  assert.ok(message.includes(combo.description));
});

test('pricing calculations: removed ingredients do not reduce price; repeated extras and sauces multiply accurately', () => {
  const uaiBurguer: CartItem = {
    cartItemId: 'item-1',
    productId: 'uai-burguer',
    name: 'UAI BURGUER',
    category: 'hamburgueres',
    basePrice: 50,
    quantity: 1,
    removedIngredients: ['Alface Americana', 'Chimichurri'],
    extras: [
      { id: 'extra-mussarela', name: 'Mussarela', unitPrice: 6, quantity: 1 },
      { id: 'extra-bacon-crocante', name: 'Bacon Crocante', unitPrice: 7, quantity: 2 },
    ],
    sauces: [
      { id: 'molho-maionese-verde', name: 'Maionese Verde', unitPrice: 3, quantity: 1 },
    ],
    observations: 'Molho separado.',
  };

  // 50 + 6 + (7 * 2) + 3 = 73
  assert.equal(calculateItemUnitPrice(uaiBurguer), 73);
  assert.equal(calculateItemTotal(uaiBurguer), 73);

  const batata: CartItem = {
    cartItemId: 'item-2',
    productId: 'batata-frita-110g',
    name: 'Batata Frita 110g',
    category: 'acompanhamentos',
    basePrice: 12,
    quantity: 2,
    removedIngredients: [],
    extras: [],
    sauces: [],
    observations: '',
  };

  assert.equal(calculateItemTotal(batata), 24);
  assert.equal(calculateCartSubtotal([uaiBurguer, batata]), 97);
  assert.equal(calculateCartItemCount([uaiBurguer, batata]), 3);
});

test('store schedule in America/Sao_Paulo: Wed-Sun 17:30-00:00 open; Mon-Tue and outside hours closed', () => {
  // America/Sao_Paulo is UTC-3 (no DST in Brazil since 2019)
  // Wednesday 2026-11-25 19:00 BRT = 2026-11-25T22:00:00Z -> OPEN
  assert.equal(getStoreStatus(new Date('2026-11-25T22:00:00Z')).isOpen, true);

  // Wednesday 2026-11-25 23:59 BRT = 2026-11-26T02:59:00Z -> OPEN (boundary inclusive)
  assert.equal(getStoreStatus(new Date('2026-11-26T02:59:00Z')).isOpen, true);

  // Thursday 2026-11-26 00:00 BRT = 2026-11-26T03:00:00Z -> CLOSED (novo dia, abre 17h30)
  const thuMidnight = getStoreStatus(new Date('2026-11-26T03:00:00Z'));
  assert.equal(thuMidnight.isOpen, false);
  assert.match(thuMidnight.statusDetail, /hoje às 17h30/i);

  // Wednesday 2026-11-25 16:00 BRT = 2026-11-25T19:00:00Z -> CLOSED
  const wedBefore = getStoreStatus(new Date('2026-11-25T19:00:00Z'));
  assert.equal(wedBefore.isOpen, false);
  assert.match(wedBefore.statusDetail, /hoje às 17h30/i);

  // Sunday 2026-11-29 20:15 BRT = 2026-11-29T23:15:00Z -> OPEN
  assert.equal(getStoreStatus(new Date('2026-11-29T23:15:00Z')).isOpen, true);

  // Monday 2026-11-30 20:00 BRT = 2026-11-30T23:00:00Z -> CLOSED, next opening quarta-feira
  const mon = getStoreStatus(new Date('2026-11-30T23:00:00Z'));
  assert.equal(mon.isOpen, false);
  assert.match(mon.statusDetail, /quarta-feira/i);

  // Tuesday 2026-12-01 20:00 BRT = 2026-12-01T23:00:00Z -> CLOSED, next opening amanhã (quarta-feira)
  const tue = getStoreStatus(new Date('2026-12-01T23:00:00Z'));
  assert.equal(tue.isOpen, false);
  assert.match(tue.statusDetail, /amanhã \(quarta-feira\)/i);
});

test('checkout validation enforces address only for delivery and change amount for dinheiro', () => {
  const sampleCart: CartItem[] = [
    {
      cartItemId: 'c1',
      productId: 'carne-queijo',
      name: 'CARNE QUEIJO',
      category: 'hamburgueres',
      basePrice: 23,
      quantity: 1,
      removedIngredients: [],
      extras: [],
      sauces: [],
      observations: '',
    },
  ];

  // Delivery missing address fails
  const invalidDelivery: CheckoutFormData = {
    orderType: 'delivery',
    customerName: 'João Silva',
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
  };
  const deliveryRes = validateCheckout(invalidDelivery, sampleCart);
  assert.equal(deliveryRes.isValid, false);
  assert.ok(deliveryRes.errors.cidade);
  assert.ok(deliveryRes.errors.bairro);
  assert.ok(deliveryRes.errors.rua);
  assert.ok(deliveryRes.errors.numero);

  // Retirada without address passes
  const validRetirada: CheckoutFormData = {
    ...invalidDelivery,
    orderType: 'retirada',
  };
  assert.equal(validateCheckout(validRetirada, sampleCart).isValid, true);

  // Dinheiro with needsChange=true and low change value fails
  const lowChange: CheckoutFormData = {
    ...validRetirada,
    paymentMethod: 'dinheiro',
    needsChange: true,
    changeFor: '20,00',
  };
  const changeRes = validateCheckout(lowChange, sampleCart);
  assert.equal(changeRes.isValid, false);
  assert.ok(changeRes.errors.changeFor);

  // Dinheiro with valid change >= subtotal passes
  const okChange: CheckoutFormData = {
    ...lowChange,
    changeFor: '50,00',
  };
  assert.equal(validateCheckout(okChange, sampleCart).isValid, true);
});

test('WhatsApp message & URL formatting obeys all rules for Delivery, Retirada, and Consumo no Local', () => {
  const items: CartItem[] = [
    {
      cartItemId: 'i1',
      productId: 'uai-burguer',
      name: 'UAI BURGUER',
      category: 'hamburgueres',
      basePrice: 50,
      quantity: 1,
      removedIngredients: ['Alface Americana'],
      extras: [{ id: 'extra-mussarela', name: 'Mussarela', unitPrice: 6, quantity: 1 }],
      sauces: [{ id: 'molho-maionese-verde', name: 'Maionese Verde', unitPrice: 3, quantity: 1 }],
      observations: 'Molho separado.',
    },
    {
      cartItemId: 'i2',
      productId: 'batata-frita-110g',
      name: 'Batata Frita 110g',
      category: 'acompanhamentos',
      basePrice: 12,
      quantity: 1,
      removedIngredients: [],
      extras: [],
      sauces: [],
      observations: '',
    },
  ];

  // 1. Delivery + Dinheiro com troco
  const deliveryForm: CheckoutFormData = {
    orderType: 'delivery',
    customerName: 'João Silva',
    customerPhone: '(16) 99999-9999',
    address: {
      cidade: 'Santo Antônio da Alegria',
      bairro: 'Centro',
      rua: 'Rua Jair Mateus Lima',
      numero: '120',
      complemento: 'Casa',
      referencia: 'Próximo à praça',
    },
    paymentMethod: 'dinheiro',
    needsChange: true,
    changeFor: '100',
  };

  const deliveryMsg = buildWhatsAppMessage(items, deliveryForm);
  assert.ok(deliveryMsg.includes('UAI BURGUER'));
  assert.ok(deliveryMsg.includes('AQUI O BURGUER É ANGUS.'));
  assert.ok(deliveryMsg.includes('PEDIDO: DELIVERY'));
  assert.ok(deliveryMsg.includes('- Sem Alface Americana.'));
  assert.ok(deliveryMsg.includes('- Adicional de Mussarela: R$\u00A06,00.'));
  assert.ok(deliveryMsg.includes('- Maionese Verde: R$\u00A03,00.'));
  assert.ok(deliveryMsg.includes('Molho separado.'));
  assert.ok(deliveryMsg.includes('1x Batata Frita 110g'));
  assert.ok(deliveryMsg.includes('Cidade: Santo Antônio da Alegria'));
  assert.ok(deliveryMsg.includes('TROCO: Sim'));
  assert.ok(deliveryMsg.includes('TROCO PARA: R$\u00A0100,00'));
  assert.ok(deliveryMsg.includes('SUBTOTAL DOS PRODUTOS: R$\u00A071,00'));
  assert.ok(deliveryMsg.includes('TAXA DE ENTREGA: A confirmar pelo estabelecimento.'));

  const url = buildWhatsAppUrl(items, deliveryForm);
  assert.ok(url.startsWith(`${STORE_CONFIG.whatsappBaseUrl}?text=`));
  assert.ok(url.includes('5516997699583'));
  assert.equal(
    url,
    buildWhatsAppUrlFromMessage(buildWhatsAppMessage(items, deliveryForm))
  );

  // 2. Retirada + Pix (no empty address fields, no Pix key)
  const retiradaForm: CheckoutFormData = {
    ...deliveryForm,
    orderType: 'retirada',
    paymentMethod: 'pix',
    needsChange: false,
    changeFor: '',
  };
  const retiradaMsg = buildWhatsAppMessage(items, retiradaForm);
  assert.ok(retiradaMsg.includes('PEDIDO: RETIRADA'));
  assert.equal(retiradaMsg.includes('ENDEREÇO:'), false);
  assert.ok(retiradaMsg.includes('Pagamento via Pix a combinar pelo WhatsApp'));

  // 3. Consumo no local + Cartão
  const localForm: CheckoutFormData = {
    ...deliveryForm,
    orderType: 'consumo_local',
    paymentMethod: 'cartao',
  };
  const localMsg = buildWhatsAppMessage(items, localForm);
  assert.ok(localMsg.includes('CONSUMO NO LOCAL'));
  assert.ok(localMsg.includes('Cartão presencialmente no estabelecimento'));
  assert.equal(localMsg.includes('ENDEREÇO:'), false);
});

test('format helpers: formatBRL, formatPhoneBR, parseBRLInput', () => {
  assert.equal(formatBRL(38), 'R$\u00A038,00');
  assert.equal(formatBRL(7.5), 'R$\u00A07,50');
  assert.equal(formatPhoneBR('16997699583'), '(16) 99769-9583');
  assert.equal(parseBRLInput('100,00'), 100);
  assert.equal(parseBRLInput('R$ 50,50'), 50.5);
  assert.equal(parseBRLInput('abc'), null);
});

test('product images: every linked image exists in public/, has no duplicates, and logo exists', () => {
  const publicDir = path.resolve(process.cwd(), 'public');
  const logoFile = path.join(publicDir, STORE_CONFIG.logoUrl.replace(/^\/+/, ''));
  assert.equal(fs.existsSync(logoFile), true, `Missing logo file: ${logoFile}`);

  const linkedPaths = new Set<string>();
  const expectedMappedIds = new Map<string, string>([
    ['classico', '/assets/aistudio/classico.jpeg.jpeg'],
    ['melt-cheddar', '/assets/aistudio/melt-cheddar.jpeg.jpeg'],
    ['chesse-burguer', '/assets/aistudio/chesse-burguer.jpeg.jpeg'],
    ['moranguetti', '/assets/aistudio/moranguetti.jpeg.jpeg'],
    ['pineaple-burgguer', '/assets/aistudio/pineaple-burgguer.jpeg.jpeg'],
    ['onios-burguer', '/assets/aistudio/onions-burguer.jpeg.jpeg'],
    ['american-burguer', '/assets/aistudio/american-burguer.jpeg.jpeg'],
    ['uai-burguer', '/assets/aistudio/uai-burguer.jpeg.jpeg'],
    ['combo-american-burguer', '/assets/aistudio/combo-american-burguer.jpeg'],
    ['combo-melt-cheddar', '/assets/aistudio/combo-melt-cheddar.jpeg'],
    ['combo-pineapple-burguer', '/assets/aistudio/combo-pineapple-burguer.jpeg'],
    ['combo-onions-burger', '/assets/aistudio/combo-onions-burger.jpeg'],
    ['combo-uai-burguer', '/assets/aistudio/combo-uai-burguer.jpeg'],
    ['combo-chesse-burger', '/assets/aistudio/combo-chesse-burguer.jpeg'],
    ['combo-monster', '/assets/aistudio/combo-monster.jpeg'],
    ['combo-classico', '/assets/aistudio/combo-classico.jpeg'],
    ['combo-smach-burger', '/assets/aistudio/combo-smach-burguer.jpeg'],
    ['combo-texas', '/assets/aistudio/Combo Texas.jpeg'],
    ['combo-morangueti', '/assets/aistudio/Combo Morangueti.jpeg'],
    ['combo-austin', '/assets/aistudio/Combo Austin.jpeg'],
    ['coca-cola-lata-350ml', '/assets/aistudio/coca-cola-lata-350ml.jpg'],
    ['coca-cola-zero-lata-350ml', '/assets/aistudio/coca-cola-zero-lata-350ml.jpg'],
    ['coca-cola-2-5l', '/assets/aistudio/coca-cola-2-5l.jpg'],
    ['guarana-2l', '/assets/aistudio/guarana-2l.jpg'],
    ['fanta-uva-2l', '/assets/aistudio/fanta-uva-2l.jpg'],
    ['limoneto-1-5-lt', '/assets/aistudio/limoneto-1-5-lt.jpg'],
    ['pepsi-2lt', '/assets/aistudio/pepsi-2lt.jpg'],
    ['fanta-laranja', '/assets/aistudio/fanta-laranja.jpg'],
  ]);

  const allProducts = [
    ...BURGERS,
    ...COMBOS,
    CUSTOM_BURGER_PRODUCT,
    ...SAUCE_PRODUCTS,
    ...SIDES,
    ...DRINKS,
  ];

  for (const product of allProducts) {
    assert.equal(
      product.imagem || '',
      product.imageUrl || '',
      `Mismatched imagem/imageUrl on ${product.id}`
    );

    const img = (product.imagem || '').trim();
    if (expectedMappedIds.has(product.id)) {
      assert.equal(img, expectedMappedIds.get(product.id));
    }

    if (img) {
      assert.equal(linkedPaths.has(img), false, `Duplicate image path: ${img}`);
      linkedPaths.add(img);
      const diskPath = path.join(publicDir, img.replace(/^\/+/, ''));
      assert.equal(fs.existsSync(diskPath), true, `Missing product image on disk: ${diskPath}`);
    }
  }

  assert.equal(linkedPaths.size, 28);
});
