import {
  CategoryId,
  ExtraItem,
  MeatDoneness,
  MenuProduct,
  SauceItem,
  StoreScheduleDay,
} from '../types/menu';

/**
 * ============================================================================
 * CONFIGURAÇÕES GERAIS DA HAMBURGUERIA — UAI BURGUER
 * ============================================================================
 * Para alterar dados comerciais, telefone, endereço ou taxas de referência,
 * edite apenas este bloco.
 */
export const STORE_CONFIG = {
  name: 'UAI BURGUER',
  displayName: 'Uai Burguer',
  slogan: 'Aqui o Burguer é Angus.',
  sloganCompact: 'Aqui o Burguer é Angus',
  /**
   * Caminho da logo oficial da UAI BURGUER.
   */
  logoUrl: '/assets/aistudio/image_2fa0b245.png' as string,
  whatsappNumberRaw: '5516997699583',
  whatsappDisplay: '(16) 99769-9583',
  whatsappBaseUrl: 'https://wa.me/5516997699583',
  address: 'Rua Jair Mateus Lima.',
  timezone: 'America/Sao_Paulo',
  deliveryReferenceRates: [
    { area: 'Santo Antônio da Alegria', feeLabel: 'Entrega grátis' },
    { area: 'Itamogi', feeLabel: 'R$ 3,00' },
    { area: 'Zona rural', feeLabel: 'R$ 3,00' },
  ],
  deliveryFeeNotice:
    'Taxa de entrega: a confirmar pelo estabelecimento.',
} as const;

/**
 * ============================================================================
 * HORÁRIOS DE FUNCIONAMENTO (Fuso: America/Sao_Paulo)
 * ============================================================================
 * 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
 */
export const STORE_SCHEDULE: StoreScheduleDay[] = [
  {
    dayIndex: 4,
    label: 'Quinta-feira',
    shortLabel: 'Qui',
    isOpenDay: true,
    openHour: 19,
    openMinute: 0,
    closeHour: 22,
    closeMinute: 30,
    displayHours: '19h às 22h30',
  },
  {
    dayIndex: 5,
    label: 'Sexta-feira',
    shortLabel: 'Sex',
    isOpenDay: true,
    openHour: 19,
    openMinute: 0,
    closeHour: 22,
    closeMinute: 30,
    displayHours: '19h às 22h30',
  },
  {
    dayIndex: 6,
    label: 'Sábado',
    shortLabel: 'Sáb',
    isOpenDay: true,
    openHour: 19,
    openMinute: 0,
    closeHour: 22,
    closeMinute: 30,
    displayHours: '19h às 22h30',
  },
  {
    dayIndex: 0,
    label: 'Domingo',
    shortLabel: 'Dom',
    isOpenDay: true,
    openHour: 19,
    openMinute: 0,
    closeHour: 22,
    closeMinute: 30,
    displayHours: '19h às 22h30',
  },
  {
    dayIndex: 1,
    label: 'Segunda-feira',
    shortLabel: 'Seg',
    isOpenDay: false,
    displayHours: 'Fechado',
  },
  {
    dayIndex: 2,
    label: 'Terça-feira',
    shortLabel: 'Ter',
    isOpenDay: false,
    displayHours: 'Fechado',
  },
  {
    dayIndex: 3,
    label: 'Quarta-feira',
    shortLabel: 'Qua',
    isOpenDay: false,
    displayHours: 'Fechado',
  },
];

/**
 * ============================================================================
 * CATEGORIAS DE NAVEGAÇÃO DO CARDÁPIO
 * ============================================================================
 */
export const MENU_CATEGORIES: { id: CategoryId; label: string; shortLabel: string }[] = [
  { id: 'hamburgueres', label: 'Hambúrgueres', shortLabel: 'Hambúrgueres' },
  { id: 'combos', label: 'COMBOS', shortLabel: 'COMBOS' },
  { id: 'monte-do-seu-jeito', label: 'Monte do Seu Jeito', shortLabel: 'Monte o Seu' },
  { id: 'molhos', label: 'Molhos', shortLabel: 'Molhos' },
  { id: 'acompanhamentos', label: 'Acompanhamentos', shortLabel: 'Acompanhamentos' },
  { id: 'refrigerantes', label: 'Refrigerantes', shortLabel: 'Refrigerantes' },
];

/**
 * ============================================================================
 * CATEGORIA: COMBOS
 * ============================================================================
 */
const COMBO_DESCRIPTION =
  'Acompanha 1 hambúrguer correspondente ao combo, porção de batata frita (~100 g) e Coca-Cola lata de 350 ml.';

const COMBO_CATALOG: [string, string, number, string?][] = [
  ['combo-chesse-burger', 'Combo Chesse Burger', 55],
  [
    'combo-onions-burger',
    'Combo Onions Burger',
    56,
    '/assets/aistudio/combo-onions-burger.jpeg',
  ],
  ['combo-monster', 'Combo Monster', 56],
  ['combo-texas', 'Combo Texas', 48],
  ['combo-hollywood', 'Combo Hollywood', 55],
  [
    'combo-pineapple-burguer',
    'Combo Pineapple Burguer',
    55,
    '/assets/aistudio/combo-pineapple-burguer.jpeg',
  ],
  ['combo-dallas-burguer', 'Combo Dallas Burguer', 57],
  [
    'combo-uai-burguer',
    'Combo Uai Burguer',
    66,
    '/assets/aistudio/combo-uai-burguer.jpeg',
  ],
  ['combo-classico', 'Combo Clássico', 52],
  [
    'combo-melt-cheddar',
    'Combo Melt Cheadder',
    54,
    '/assets/aistudio/combo-melt-cheddar.jpeg',
  ],
  ['combo-morangueti', 'Combo Morangueti', 55],
  ['combo-austin', 'Combo Austin', 51],
  ['combo-smach-burger', 'Combo Smach Burger', 46],
  [
    'combo-american-burguer',
    'Combo American Burguer',
    57,
    '/assets/aistudio/combo-american-burguer.jpeg',
  ],
];

export const COMBOS: MenuProduct[] = COMBO_CATALOG.map(
  ([id, name, price, imageUrl = '']) => ({
    id,
    name,
    category: 'combos',
    price,
    description: COMBO_DESCRIPTION,
    ingredients: [],
    customizable: false,
    imagem: imageUrl,
    imageUrl,
    available: true,
  })
);

/**
 * ============================================================================
 * OPÇÕES DE PONTO DA CARNE (Exclusivo para "Monte do Seu Jeito")
 * ============================================================================
 */
export const MEAT_DONENESS_OPTIONS: MeatDoneness[] = [
  'Bem passada',
  'Ao ponto',
  'Mal passada',
];

/**
 * ============================================================================
 * ADICIONAIS DISPONÍVEIS
 * ============================================================================
 * Para alterar preço, nome ou disponibilidade (available: true/false),
 * edite os itens abaixo.
 */
export const EXTRAS: ExtraItem[] = [
  { id: 'extra-hamburguer-angus-150g', name: 'Hambúrguer Angus 150g', price: 15.0, available: true },
  { id: 'extra-mussarela', name: 'Mussarela', price: 6.0, available: true },
  { id: 'extra-catupiry-scala', name: 'Catupiry Scala', price: 7.0, available: true },
  { id: 'extra-cebola-onions', name: 'Cebola Onions', price: 6.0, available: true },
  { id: 'extra-mel-e-mostarda', name: 'Mel e Mostarda', price: 5.0, available: true },
  { id: 'extra-queijo-prato', name: 'Queijo Prato', price: 6.0, available: true },
  { id: 'extra-geleia-de-morango', name: 'Geleia de Morango', price: 7.0, available: true },
  { id: 'extra-rucula', name: 'Rúcula', price: 1.0, available: true },
  { id: 'extra-alface-americana', name: 'Alface Americana', price: 1.0, available: true },
  { id: 'extra-crocanhase-frito', name: 'Crocanhase Frito', price: 8.0, available: true },
  { id: 'extra-tomate', name: 'Tomate', price: 3.0, available: true },
  { id: 'extra-cebola-caramelizada', name: 'Cebola Caramelizada', price: 5.0, available: true },
  { id: 'extra-bacon-crocante', name: 'Bacon Crocante', price: 7.0, available: true },
  { id: 'extra-cream-chesse', name: 'Cream Chesse', price: 8.0, available: true },
  { id: 'extra-picles-de-pepino', name: 'Picles de Pepino', price: 4.0, available: true },
  { id: 'extra-cebola-roxa', name: 'Cebola Roxa', price: 3.0, available: true },
  { id: 'extra-ovo', name: 'Ovo', price: 3.0, available: true },
  { id: 'extra-chimichurri', name: 'Chimichurri', price: 5.0, available: true },
  { id: 'extra-crocanhesse-empanado', name: 'Crocanhesse (Queijo empanado)', price: 10.0, available: true },
];

/**
 * ============================================================================
 * MOLHOS DISPONÍVEIS (Tanto na categoria Molhos quanto na personalização)
 * ============================================================================
 * Para inserir foto oficial no futuro, preencha o campo imageUrl de cada molho.
 */
export const SAUCES: SauceItem[] = [
  { id: 'molho-cheddar-cremoso', name: 'Cheddar Cremoso', price: 7.0, available: true, imagem: '', imageUrl: '' },
  { id: 'molho-gorgonzola', name: 'Gorgonzola', price: 6.0, available: true, imagem: '', imageUrl: '' },
  { id: 'molho-maionese-defumada', name: 'Maionese Defumada', price: 3.0, available: true, imagem: '', imageUrl: '' },
  { id: 'molho-maionese-verde', name: 'Maionese Verde', price: 3.0, available: true, imagem: '', imageUrl: '' },
  { id: 'molho-maionese-com-bacon', name: 'Maionese com Bacon', price: 5.0, available: true, imagem: '', imageUrl: '' },
  { id: 'molho-especial', name: 'Molho Especial', price: 5.0, available: true, imagem: '', imageUrl: '' },
  { id: 'molho-barbecue', name: 'Molho Barbecue', price: 5.0, available: true, imagem: '', imageUrl: '' },
];

/**
 * ============================================================================
 * CATEGORIA: HAMBÚRGUERES (15 opções oficiais)
 * ============================================================================
 * COMO ADICIONAR FOTOGRAFIAS OFICIAIS NO FUTURO:
 * 1. Salve as fotos na pasta /public/images/ (ex: /public/images/uai-burguer.jpg).
 * 2. Preencha o campo `imageUrl` do produto correspondente (ex: '/images/uai-burguer.jpg').
 * 3. Nenhuma outra parte do sistema precisa ser alterada.
 */
export const BURGERS: MenuProduct[] = [
  {
    id: 'carne-queijo',
    name: 'CARNE QUEIJO',
    category: 'hamburgueres',
    price: 23.0,
    ingredients: ['Pão de Brioche', 'Hambúrguer Angus 150g', 'Queijo Prato'],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '',
    imageUrl: '',
    available: true,
  },
  {
    id: 'smach-burguer',
    name: 'SMACH BURGUER',
    category: 'hamburgueres',
    price: 28.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Queijo Prato',
      'Alface Americana',
      'Tomate',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '',
    imageUrl: '',
    available: true,
  },
  {
    id: 'texas',
    name: 'TEXAS',
    category: 'hamburgueres',
    price: 30.0,
    ingredients: [
      'Pão de Brioche ou Pão Australiano',
      'Frango Grelhado',
      'Mussarela',
      'Alface Americana',
      'Maionese Verde',
      'Catupiry',
      'Blend de Queijos',
    ],
    nonRemovableIngredients: ['Pão de Brioche ou Pão Australiano', 'Frango Grelhado'],
    breadOptions: ['Pão de Brioche', 'Pão Australiano'],
    customizable: true,
    imagem: '',
    imageUrl: '',
    available: true,
  },
  {
    id: 'austin',
    name: 'AUSTIN',
    category: 'hamburgueres',
    price: 34.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Queijo Prato',
      'Maionese Verde',
      'Alface Americana',
      'Picles',
      'Cebola Roxa',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '',
    imageUrl: '',
    available: true,
  },
  {
    id: 'classico',
    name: 'CLÁSSICO',
    category: 'hamburgueres',
    price: 35.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Rúcula',
      'Mel e Mostarda',
      'Bacon Crocante',
      'Maionese da Casa',
      'Queijo Prato',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '/assets/aistudio/classico.jpeg.jpeg',
    imageUrl: '/assets/aistudio/classico.jpeg.jpeg',
    available: true,
  },
  {
    id: 'melt-cheddar',
    name: 'MELT CHEDDAR',
    category: 'hamburgueres',
    price: 37.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Alface Americana',
      'Bacon',
      'Cheddar',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '/assets/aistudio/melt-cheddar.jpeg.jpeg',
    imageUrl: '/assets/aistudio/melt-cheddar.jpeg.jpeg',
    available: true,
  },
  {
    id: 'chesse-burguer',
    name: 'CHESSE BURGUER',
    category: 'hamburgueres',
    price: 38.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Mussarela',
      'Ovo',
      'Alface Americana',
      'Maionese da Casa',
      'Tomate',
      'Bacon Crocante',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '/assets/aistudio/chesse-burguer.jpeg.jpeg',
    imageUrl: '/assets/aistudio/chesse-burguer.jpeg.jpeg',
    available: true,
  },
  {
    id: 'moranguetti',
    name: 'MORANGUETTI',
    category: 'hamburgueres',
    price: 38.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Rúcula',
      'Maionese Verde',
      'Queijo Gorgonzola',
      'Geleia de Morango',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '/assets/aistudio/moranguetti.jpeg.jpeg',
    imageUrl: '/assets/aistudio/moranguetti.jpeg.jpeg',
    available: true,
  },
  {
    id: 'hollywood',
    name: 'HOLLYWOOD',
    category: 'hamburgueres',
    price: 38.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Cheddar Cremoso',
      'Cebola Caramelizada',
      'Maionese da Casa',
      'Bacon Crocante',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '',
    imageUrl: '',
    available: true,
  },
  {
    id: 'pineaple-burgguer',
    name: 'PINEAPLE BURGGUER',
    category: 'hamburgueres',
    price: 38.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Queijo Prato',
      'Bacon Crocante',
      'Cebola Roxa',
      'Tomate',
      'Molho Barbecue',
      'Abacaxi',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '/assets/aistudio/pineaple-burgguer.jpeg.jpeg',
    imageUrl: '/assets/aistudio/pineaple-burgguer.jpeg.jpeg',
    available: true,
  },
  {
    id: 'monster',
    name: 'MONSTER',
    category: 'hamburgueres',
    price: 39.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Bacon Crocante',
      'Cebola Caramelizada',
      'Cheddar Cremoso',
      'Tomate',
      'Alface Americana',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '',
    imageUrl: '',
    available: true,
  },
  {
    id: 'onios-burguer',
    name: 'ONIOS BURGUER',
    category: 'hamburgueres',
    price: 39.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Queijo Prato',
      'Catupiry',
      'Alface Americana',
      'Cebola Onions',
      'Bacon Crocante',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '/assets/aistudio/onions-burguer.jpeg.jpeg',
    imageUrl: '/assets/aistudio/onions-burguer.jpeg.jpeg',
    available: true,
  },
  {
    id: 'dallas-burguer',
    name: 'DALLA´S BURGUER',
    category: 'hamburgueres',
    price: 39.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Provolone Cream Chesse',
      'Cebola Caramelizada',
      'Maionese da Casa',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '',
    imageUrl: '',
    available: true,
  },
  {
    id: 'american-burguer',
    name: 'AMERICAN BURGUER',
    category: 'hamburgueres',
    price: 39.0,
    ingredients: [
      'Pão de Brioche',
      'Hambúrguer Angus 150g',
      'Mussarela',
      'Molho Especial',
      'Alface Americana',
      'Tomate',
      'Crocanhesse',
    ],
    nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
    customizable: true,
    imagem: '/assets/aistudio/american-burguer.jpeg.jpeg',
    imageUrl: '/assets/aistudio/american-burguer.jpeg.jpeg',
    available: true,
  },
  {
    id: 'uai-burguer',
    name: 'UAI BURGUER',
    category: 'hamburgueres',
    price: 50.0,
    ingredients: [
      'Pão de Brioche',
      '2 Hambúrgueres Angus 150g',
      'Queijo Prato',
      'Bacon Crocante',
      'Chimichurri',
      'Alface Americana',
      'Maionese Defumada',
    ],
    nonRemovableIngredients: ['Pão de Brioche', '2 Hambúrgueres Angus 150g'],
    customizable: true,
    featured: true,
    imagem: '/assets/aistudio/uai-burguer.jpeg.jpeg',
    imageUrl: '/assets/aistudio/uai-burguer.jpeg.jpeg',
    available: true,
  },

]; 
/**
 * ============================================================================
 * CATEGORIA: MONTE DO SEU JEITO
 * ============================================================================
 */
export const CUSTOM_BURGER_PRODUCT: MenuProduct = {
  id: 'monte-do-seu-jeito',
  name: 'MONTE DO SEU JEITO',
  category: 'monte-do-seu-jeito',
  price: 23.0,
  description:
    'Comece pela base Angus 150g com queijo prato, escolha o pão, defina o ponto da carne e combine seus adicionais e molhos preferidos.',
  ingredients: ['Pão de Brioche', 'Hambúrguer Angus 150g', 'Queijo Prato'],
  nonRemovableIngredients: ['Pão de Brioche', 'Hambúrguer Angus 150g'],
  breadOptions: ['Pão de Brioche', 'Pão Gergelim'],
  allowsMeatDoneness: true,
  customizable: true,
  imagem: '',
    imageUrl: '',
  available: true,
};

/**
 * ============================================================================
 * CATEGORIA: ACOMPANHAMENTOS
 * ============================================================================
 */
export const SIDES: MenuProduct[] = [
  {
    id: 'batata-frita-110g',
    name: 'Batata Frita 110g',
    category: 'acompanhamentos',
    price: 12.0,
    description: 'Porção individual de 110g, sequinha e crocante.',
    ingredients: [],
    customizable: false,
    imagem: '',
    imageUrl: '',
    available: true,
  },
];

/**
 * ============================================================================
 * CATEGORIA: REFRIGERANTES (Latas e Garrafas)
 * ============================================================================
 */
export const DRINKS: MenuProduct[] = [
  // Latas
  {
    id: 'coca-cola-lata-350ml',
    name: 'Coca-Cola Lata 350ml',
    category: 'refrigerantes',
    subcategory: 'Latas',
    price: 7.0,
    ingredients: [],
    customizable: false,
    imagem: '/assets/aistudio/coca-cola-lata-350ml.jpg',
    imageUrl: '/assets/aistudio/coca-cola-lata-350ml.jpg',
    available: true,
  },
  {
    id: 'coca-cola-zero-lata-350ml',
    name: 'Coca-Cola Zero Lata 350ml',
    category: 'refrigerantes',
    subcategory: 'Latas',
    price: 7.5,
    ingredients: [],
    customizable: false,
    imagem: '/assets/aistudio/coca-cola-zero-lata-350ml.jpg',
    imageUrl: '/assets/aistudio/coca-cola-zero-lata-350ml.jpg',
    available: true,
  },
  // Garrafas
  {
    id: 'coca-cola-2-5l',
    name: 'Coca-Cola 2,5 L',
    category: 'refrigerantes',
    subcategory: 'Garrafas',
    price: 17.0,
    ingredients: [],
    customizable: false,
    imagem: '/assets/aistudio/coca-cola-2-5l.jpg',
    imageUrl: '/assets/aistudio/coca-cola-2-5l.jpg',
    available: true,
  },
  {
    id: 'guarana-2l',
    name: 'Guaraná 2L',
    category: 'refrigerantes',
    subcategory: 'Garrafas',
    price: 13.0,
    ingredients: [],
    customizable: false,
    imagem: '/assets/aistudio/guarana-2l.jpg',
    imageUrl: '/assets/aistudio/guarana-2l.jpg',
    available: true,
  },
  {
    id: 'fanta-uva-2l',
    name: 'Fanta Uva 2L',
    category: 'refrigerantes',
    subcategory: 'Garrafas',
    price: 13.0,
    ingredients: [],
    customizable: false,
    imagem: '/assets/aistudio/fanta-uva-2l.jpg',
    imageUrl: '/assets/aistudio/fanta-uva-2l.jpg',
    available: true,
  },
  {
    id: 'fanta-laranja',
    name: 'Fanta Laranja',
    category: 'refrigerantes',
    subcategory: 'Garrafas',
    price: 13.0,
    ingredients: [],
    customizable: false,
    imagem: '/assets/aistudio/fanta-laranja.jpg',
    imageUrl: '/assets/aistudio/fanta-laranja.jpg',
    available: true,
  },
  {
    id: 'pepsi-2lt',
    name: 'Pepsi 2LT',
    category: 'refrigerantes',
    subcategory: 'Garrafas',
    price: 13.0,
    ingredients: [],
    customizable: false,
    imagem: '/assets/aistudio/pepsi-2lt.jpg',
    imageUrl: '/assets/aistudio/pepsi-2lt.jpg',
    available: true,
  },
  {
    id: 'limoneto-1-5-lt',
    name: 'Limoneto 1,5 LT',
    category: 'refrigerantes',
    subcategory: 'Garrafas',
    price: 8.0,
    ingredients: [],
    customizable: false,
    imagem: '/assets/aistudio/limoneto-1-5-lt.jpg',
    imageUrl: '/assets/aistudio/limoneto-1-5-lt.jpg',
    available: true,
  },
];

/**
 * Converte um molho avulso para o formato MenuProduct para exibição na categoria Molhos.
 */
export const SAUCE_PRODUCTS: MenuProduct[] = SAUCES.map((sauce) => ({
  id: sauce.id,
  name: sauce.name,
  category: 'molhos',
  price: sauce.price,
  ingredients: [],
  customizable: false,
  imagem: sauce.imagem || sauce.imageUrl || '',
  imageUrl: sauce.imageUrl || sauce.imagem || '',
  available: sauce.available,
}));

/**
 * Busca qualquer produto do cardápio por ID.
 */
export function getProductById(productId: string): MenuProduct | undefined {
  if (productId === CUSTOM_BURGER_PRODUCT.id) {
    return CUSTOM_BURGER_PRODUCT;
  }
  return (
    BURGERS.find((p) => p.id === productId) ||
    COMBOS.find((p) => p.id === productId) ||
    SAUCE_PRODUCTS.find((p) => p.id === productId) ||
    SIDES.find((p) => p.id === productId) ||
    DRINKS.find((p) => p.id === productId)
  );
}
