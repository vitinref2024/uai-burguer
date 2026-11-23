export type CategoryId =
  | 'hamburgueres'
  | 'combos'
  | 'monte-do-seu-jeito'
  | 'molhos'
  | 'acompanhamentos'
  | 'refrigerantes';

export type DrinkSubcategory = 'Latas' | 'Garrafas';

export type MeatDoneness = 'Bem passada' | 'Ao ponto' | 'Mal passada';

export interface ProductIngredient {
  name: string;
  /** Se falso, o ingrediente é estrutural (ex: pão ou carne base) e não pode ser removido. */
  removable?: boolean;
}

export interface MenuProduct {
  id: string;
  name: string;
  category: CategoryId;
  /** Preço base em reais (numérico). */
  price: number;
  /** Descrição opcional complementar ao card. */
  description?: string;
  /** Lista de ingredientes que compõem o produto. */
  ingredients: string[];
  /** Ingredientes que não podem ser retirados (ex: pão quando há seletor ou base). */
  nonRemovableIngredients?: string[];
  /** Opções de pão disponíveis exclusivamente para este produto, quando aplicável. */
  breadOptions?: string[];
  /** Define se o produto permite escolha de ponto da carne (exclusivo Monte do Seu Jeito). */
  allowsMeatDoneness?: boolean;
  /** Define se abre janela de personalização (hambúrgueres e Monte do Seu Jeito). */
  customizable?: boolean;
  /** Subgrupo para bebidas (Latas / Garrafas). */
  subcategory?: DrinkSubcategory;
  /**
   * Caminho ou URL da fotografia oficial do produto.
   * Deixe vazio ('') enquanto as fotos oficiais não forem adicionadas.
   * Exemplo futuro: '/images/produtos/uai-burguer.jpg'
   */
  imagem?: string;
  /** Alias compatível com versões anteriores. */
  imageUrl?: string;
  /** Disponibilidade para exibição/pedido (true = disponível). */
  available: boolean;
  /** Destaque editorial discreto opcional (ex: clássico da casa). */
  featured?: boolean;
}

export interface ExtraItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface SauceItem {
  id: string;
  name: string;
  price: number;
  available: boolean;
  /**
   * Caminho da fotografia oficial do molho para o cardápio.
   * Deixe vazio ('') para exibir o placeholder padrão.
   */
  imagem?: string;
  imageUrl?: string;
}

export interface SelectedOptionItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface CartItem {
  /** Identificador único da instância no carrinho (cada personalização mantém suas próprias escolhas). */
  cartItemId: string;
  productId: string;
  name: string;
  category: CategoryId;
  basePrice: number;
  quantity: number;
  selectedBread?: string;
  selectedDoneness?: MeatDoneness;
  removedIngredients: string[];
  extras: SelectedOptionItem[];
  sauces: SelectedOptionItem[];
  observations: string;
}

export type OrderType = 'delivery' | 'retirada' | 'consumo_local';

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao';

export interface DeliveryAddress {
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
  referencia: string;
}

export interface CheckoutFormData {
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  address: DeliveryAddress;
  paymentMethod: PaymentMethod;
  needsChange: boolean;
  changeFor: string;
}

export interface StoreScheduleDay {
  dayIndex: number; // 0 = Domingo ... 6 = Sábado
  label: string;
  shortLabel: string;
  isOpenDay: boolean;
  openHour?: number;
  openMinute?: number;
  closeHour?: number;
  closeMinute?: number;
  displayHours: string;
}

export interface StoreStatus {
  isOpen: boolean;
  currentDayIndex: number;
  currentTimeFormatted: string;
  statusHeadline: string;
  statusDetail: string;
  nextOpeningText: string;
  compactClosedLabel?: string;
}
