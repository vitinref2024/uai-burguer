import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import {
  BURGERS,
  COMBOS,
  CUSTOM_BURGER_PRODUCT,
  DRINKS,
  MENU_CATEGORIES,
  SAUCE_PRODUCTS,
  SIDES,
  getProductById,
} from './data/menu';
import {
  CartItem,
  CategoryId,
  CheckoutFormData,
  MenuProduct,
} from './types/menu';
import { calculateCartItemCount, calculateCartSubtotal } from './utils/pricing';
import {
  getBlackFridayComboProducts,
  getEffectiveProductPrice,
  getProductPromoInfo,
  isBlackFridayActive,
  sortCombosForDisplay,
  syncCartItemsWithPromotions,
} from './utils/promotions';
import { getStoreStatus } from './utils/schedule';
import { BlackFridaySection } from './components/BlackFridaySection';
import { Header } from './components/Header';
import { StoreInfoBar } from './components/StoreInfoBar';
import { StoreInfoModal } from './components/StoreInfoModal';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomizationModal } from './components/CustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { MobileCartBar } from './components/MobileCartBar';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';

const CART_STORAGE_KEY = 'uai_burguer_cart_v1';
const CHECKOUT_STORAGE_KEY = 'uai_burguer_checkout_v1';

const DEFAULT_CHECKOUT_FORM: CheckoutFormData = {
  orderType: 'delivery',
  customerName: '',
  customerPhone: '',
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

function loadInitialCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed
      .filter(
        (item): item is CartItem =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof item.cartItemId === 'string' &&
          typeof item.productId === 'string' &&
          typeof item.name === 'string' &&
          typeof item.basePrice === 'number' &&
          Number.isFinite(item.basePrice) &&
          typeof item.quantity === 'number' &&
          item.quantity > 0
      )
      .map((item) => ({
        ...item,
        quantity: Math.max(1, Math.floor(item.quantity)),
        removedIngredients: Array.isArray(item.removedIngredients)
          ? item.removedIngredients.filter((v): v is string => typeof v === 'string')
          : [],
        extras: Array.isArray(item.extras) ? item.extras : [],
        sauces: Array.isArray(item.sauces) ? item.sauces : [],
        observations: typeof item.observations === 'string' ? item.observations : '',
      }));
    return syncCartItemsWithPromotions(normalized);
  } catch {
    return [];
  }
}

function loadInitialCheckout(): CheckoutFormData {
  try {
    const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return DEFAULT_CHECKOUT_FORM;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CHECKOUT_FORM,
      ...parsed,
      address: {
        ...DEFAULT_CHECKOUT_FORM.address,
        ...(parsed?.address || {}),
      },
    };
  } catch {
    return DEFAULT_CHECKOUT_FORM;
  }
}

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadInitialCart);
  const [checkoutForm, setCheckoutForm] =
    useState<CheckoutFormData>(loadInitialCheckout);
  const [activeCategory, setActiveCategory] =
    useState<CategoryId>('hamburgueres');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Modal de detalhes do produto (ao tocar no card/imagem)
  const [detailProduct, setDetailProduct] = useState<MenuProduct | null>(null);

  // Estado do modal de personalização (novo item ou edição de item existente)
  const [customizingProduct, setCustomizingProduct] =
    useState<MenuProduct | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);

  // Confirmação discreta "Adicionado" + leve animação no contador do carrinho
  const [addedToastName, setAddedToastName] = useState<string | null>(null);
  const [cartBump, setCartBump] = useState(false);
  const toastTimerRef = useRef<number | null>(null);
  const bumpTimerRef = useRef<number | null>(null);

  // Verificação automática do horário e vigência da Black Friday em America/Sao_Paulo
  const [storeStatus, setStoreStatus] = useState(() => getStoreStatus());
  const [isBlackFriday, setIsBlackFriday] = useState(() => isBlackFridayActive());

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = new Date();
      setStoreStatus(getStoreStatus(now));
      setIsBlackFriday(isBlackFridayActive(now));
    }, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setCartItems((prev) => syncCartItemsWithPromotions(prev));
  }, [isBlackFriday]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (bumpTimerRef.current) window.clearTimeout(bumpTimerRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignora indisponibilidade de storage privado
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutForm));
    } catch {
      // Ignora indisponibilidade de storage privado
    }
  }, [checkoutForm]);

  // Acompanhamento automático da categoria ativa conforme a rolagem
  useEffect(() => {
    const sections = MENU_CATEGORIES.map((cat) =>
      document.getElementById(cat.id)
    ).filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveCategory(visible[0].target.id as CategoryId);
        }
      },
      { rootMargin: '-12% 0px -70% 0px', threshold: [0.1, 0.35] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const triggerAddedFeedback = useCallback((productName: string) => {
    setAddedToastName(productName);
    setCartBump(true);

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    if (bumpTimerRef.current) window.clearTimeout(bumpTimerRef.current);

    bumpTimerRef.current = window.setTimeout(() => setCartBump(false), 180);
    toastTimerRef.current = window.setTimeout(
      () => setAddedToastName(null),
      1800
    );
  }, []);

  const cartItemCount = useMemo(
    () => calculateCartItemCount(cartItems),
    [cartItems]
  );
  const cartSubtotal = useMemo(
    () => calculateCartSubtotal(cartItems),
    [cartItems]
  );

  const productQuantities = useMemo(() => {
    const counts: Record<string, number> = {};
    cartItems.forEach((item) => {
      counts[item.productId] = (counts[item.productId] || 0) + item.quantity;
    });
    return counts;
  }, [cartItems]);

  const scrollToCategory = (categoryId: CategoryId) => {
    setActiveCategory(categoryId);
    const target = document.getElementById(categoryId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenCustomize = useCallback((product: MenuProduct) => {
    setEditingCartItem(null);
    setCustomizingProduct(product);
  }, []);

  const handleEditCartItem = useCallback((item: CartItem) => {
    const product = getProductById(item.productId);
    if (!product) return;
    setIsCartOpen(false);
    setEditingCartItem(item);
    setCustomizingProduct(product);
  }, []);

  const handleSaveCustomizedItem = useCallback((savedItem: CartItem) => {
    const isEditing = Boolean(editingCartItem);
    setCartItems((prev) => {
      const existsIndex = prev.findIndex(
        (item) => item.cartItemId === savedItem.cartItemId
      );
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = savedItem;
        return next;
      }
      return [...prev, savedItem];
    });
    setCustomizingProduct(null);
    setEditingCartItem(null);
    if (!isEditing) {
      triggerAddedFeedback(savedItem.name);
    }
  }, [editingCartItem, triggerAddedFeedback]);

  // Adição rápida via botão "+" ou botão "Adicionar" do modal de detalhes
  const handleQuickAdd = useCallback((product: MenuProduct) => {
    const defaultBread = product.breadOptions?.[0];
    const defaultDoneness = product.allowsMeatDoneness ? 'Ao ponto' : undefined;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.selectedBread === defaultBread &&
          item.selectedDoneness === defaultDoneness &&
          item.removedIngredients.length === 0 &&
          item.extras.length === 0 &&
          item.sauces.length === 0 &&
          item.observations === ''
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      }
      const effectiveBasePrice = getEffectiveProductPrice(product);
      return [
        ...prev,
        {
          cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: product.id,
          name: product.name,
          category: product.category,
          basePrice: effectiveBasePrice,
          quantity: 1,
          selectedBread: defaultBread,
          selectedDoneness: defaultDoneness,
          removedIngredients: [],
          extras: [],
          sauces: [],
          observations: '',
        },
      ];
    });

    triggerAddedFeedback(product.name);
  }, [triggerAddedFeedback]);

  const handleUpdateCartQuantity = useCallback((cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const handleRemoveCartItem = useCallback((cartItemId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.cartItemId !== cartItemId)
    );
  }, []);

  const handleOpenCart = useCallback(() => setIsCartOpen(true), []);
  const handleCloseCart = useCallback(() => setIsCartOpen(false), []);
  const handleOpenInfo = useCallback(() => setIsInfoOpen(true), []);
  const handleCloseInfo = useCallback(() => setIsInfoOpen(false), []);
  const handleCloseDetail = useCallback(() => setDetailProduct(null), []);
  const handleCloseCustomize = useCallback(() => {
    setCustomizingProduct(null);
    setEditingCartItem(null);
  }, []);
  const handleClearCart = useCallback(() => setCartItems([]), []);

  const availableBurgers = useMemo(
    () => BURGERS.filter((p) => p.available),
    []
  );
  const availableCombos = useMemo(
    () => sortCombosForDisplay(COMBOS.filter((p) => p.available)),
    [isBlackFriday]
  );
  const blackFridayCombos = useMemo(
    () => (isBlackFriday ? getBlackFridayComboProducts() : []),
    [isBlackFriday]
  );
  const availableSauces = useMemo(
    () => SAUCE_PRODUCTS.filter((p) => p.available),
    []
  );
  const availableSides = useMemo(
    () => SIDES.filter((p) => p.available),
    []
  );
  const drinkCans = useMemo(
    () => DRINKS.filter((p) => p.available && p.subcategory === 'Latas'),
    []
  );
  const drinkBottles = useMemo(
    () => DRINKS.filter((p) => p.available && p.subcategory === 'Garrafas'),
    []
  );
  const totalDrinksCount = drinkCans.length + drinkBottles.length;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#FFFFFF]">
      {/* 1. Topo compacto com logo oficial circular, nome, slogan e carrinho */}
      <Header
        cartItemCount={cartItemCount}
        cartBump={cartBump}
        onOpenCart={handleOpenCart}
      />

      {isBlackFriday && (
        <BlackFridaySection
          combos={blackFridayCombos}
          productQuantities={productQuantities}
          onExploreOffers={() => scrollToCategory('combos')}
          onOpenDetail={setDetailProduct}
          onQuickAdd={handleQuickAdd}
        />
      )}

      <Hero
        storeStatus={storeStatus}
        onExploreMenu={() => scrollToCategory('hamburgueres')}
      />

      {/* 2. Faixa compacta de status e ações com rótulos visíveis */}
      <StoreInfoBar
        storeStatus={storeStatus}
        onOpenInfo={handleOpenInfo}
      />

      {/* 3. Barra fixa de categorias (sticky) com destaque amarelo #F5B700 */}
      <nav
        aria-label="Categorias do cardápio"
        className="sticky top-0 z-30 border-b border-[#262626] bg-[#0B0B0B]/95 backdrop-blur-sm"
      >
        <div className="no-scrollbar mx-auto flex max-w-[1040px] items-center gap-5 overflow-x-auto px-4">
          {MENU_CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => scrollToCategory(category.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`relative flex min-h-[46px] items-center text-[13.5px] font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#F5B700]'
                    : 'text-[#B3B3B3] hover:text-[#FFFFFF]'
                }`}
              >
                <span>{category.shortLabel}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-t bg-[#F5B700]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. Cardápio principal — 1 coluna no celular, 2 colunas (máx 1040px) no computador */}
      <main className="mx-auto max-w-[1040px] space-y-9 px-4 pb-14 pt-6">
        {/* CATEGORIA: HAMBÚRGUERES */}
        <section id="hamburgueres" aria-labelledby="heading-hamburgueres">
          <div className="flex items-baseline gap-2.5 border-l-[3px] border-[#F5B700] pl-3">
            <h1
              id="heading-hamburgueres"
              className="text-[19px] font-bold tracking-tight text-[#FFFFFF]"
            >
              Hambúrgueres
            </h1>
            <span className="price-num text-[13px] font-medium text-[#8A8A8A]">
              {availableBurgers.length}
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {availableBurgers.map((burger) => (
              <ProductCard
                key={burger.id}
                product={burger}
                quantityInCart={productQuantities[burger.id] || 0}
                onOpenDetail={setDetailProduct}
                onCustomize={handleOpenCustomize}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        </section>

        {/* CATEGORIA: COMBOS */}
        <section
          id="combos"
          aria-labelledby="heading-combos"
          className="border-t border-[#262626] pt-7"
        >
          <div className="flex items-baseline gap-2.5 border-l-[3px] border-[#F5B700] pl-3">
            <h2
              id="heading-combos"
              className="text-[19px] font-bold tracking-tight text-[#FFFFFF]"
            >
              COMBOS
            </h2>
            <span className="price-num text-[13px] font-medium text-[#8A8A8A]">
              {availableCombos.length}
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {availableCombos.map((combo) => {
              const promo = getProductPromoInfo(combo);
              return (
                <ProductCard
                  key={combo.id}
                  product={combo}
                  quantityInCart={productQuantities[combo.id] || 0}
                  effectivePrice={promo.currentPrice}
                  isBlackFridayPromo={promo.isPromo}
                  onOpenDetail={setDetailProduct}
                  onQuickAdd={handleQuickAdd}
                />
              );
            })}
          </div>
        </section>

        {/* CATEGORIA: MONTE O SEU */}
        <section
          id="monte-do-seu-jeito"
          aria-labelledby="heading-monte-do-seu-jeito"
          className="border-t border-[#262626] pt-7"
        >
          <div className="flex items-baseline gap-2.5 border-l-[3px] border-[#F5B700] pl-3">
            <h2
              id="heading-monte-do-seu-jeito"
              className="text-[19px] font-bold tracking-tight text-[#FFFFFF]"
            >
              Monte o Seu
            </h2>
            <span className="price-num text-[13px] font-medium text-[#8A8A8A]">
              1
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <ProductCard
              product={CUSTOM_BURGER_PRODUCT}
              quantityInCart={productQuantities[CUSTOM_BURGER_PRODUCT.id] || 0}
              onOpenDetail={setDetailProduct}
              onCustomize={handleOpenCustomize}
              onQuickAdd={handleQuickAdd}
            />
          </div>
        </section>

        {/* CATEGORIA: MOLHOS */}
        <section
          id="molhos"
          aria-labelledby="heading-molhos"
          className="border-t border-[#262626] pt-7"
        >
          <div className="flex items-baseline gap-2.5 border-l-[3px] border-[#F5B700] pl-3">
            <h2
              id="heading-molhos"
              className="text-[19px] font-bold tracking-tight text-[#FFFFFF]"
            >
              Molhos
            </h2>
            <span className="price-num text-[13px] font-medium text-[#8A8A8A]">
              {availableSauces.length}
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {availableSauces.map((sauce) => (
              <ProductCard
                key={sauce.id}
                product={sauce}
                quantityInCart={productQuantities[sauce.id] || 0}
                onOpenDetail={setDetailProduct}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        </section>

        {/* CATEGORIA: ACOMPANHAMENTOS */}
        <section
          id="acompanhamentos"
          aria-labelledby="heading-acompanhamentos"
          className="border-t border-[#262626] pt-7"
        >
          <div className="flex items-baseline gap-2.5 border-l-[3px] border-[#F5B700] pl-3">
            <h2
              id="heading-acompanhamentos"
              className="text-[19px] font-bold tracking-tight text-[#FFFFFF]"
            >
              Acompanhamentos
            </h2>
            <span className="price-num text-[13px] font-medium text-[#8A8A8A]">
              {availableSides.length}
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {availableSides.map((side) => (
              <ProductCard
                key={side.id}
                product={side}
                quantityInCart={productQuantities[side.id] || 0}
                onOpenDetail={setDetailProduct}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        </section>

        {/* CATEGORIA: REFRIGERANTES (Latas e Garrafas) */}
        <section
          id="refrigerantes"
          aria-labelledby="heading-refrigerantes"
          className="border-t border-[#262626] pt-7"
        >
          <div className="flex items-baseline gap-2.5 border-l-[3px] border-[#F5B700] pl-3">
            <h2
              id="heading-refrigerantes"
              className="text-[19px] font-bold tracking-tight text-[#FFFFFF]"
            >
              Refrigerantes
            </h2>
            <span className="price-num text-[13px] font-medium text-[#8A8A8A]">
              {totalDrinksCount}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#8A8A8A]">
              Latas
            </h3>
            <div className="mt-2.5 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {drinkCans.map((drink) => (
                <ProductCard
                  key={drink.id}
                  product={drink}
                  quantityInCart={productQuantities[drink.id] || 0}
                  onOpenDetail={setDetailProduct}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[#8A8A8A]">
              Garrafas
            </h3>
            <div className="mt-2.5 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {drinkBottles.map((drink) => (
                <ProductCard
                  key={drink.id}
                  product={drink}
                  quantityInCart={productQuantities[drink.id] || 0}
                  onOpenDetail={setDetailProduct}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer onOpenInfo={handleOpenInfo} />

      {/* Confirmação discreta "Adicionado" */}
      {addedToastName && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2 md:bottom-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F5B700] px-4 py-2 text-[13px] font-bold text-[#0B0B0B] shadow-lg transition-opacity duration-150">
            <Check
              className="h-3.5 w-3.5 text-[#0B0B0B]"
              strokeWidth={2.75}
              aria-hidden="true"
            />
            <span>Adicionado</span>
          </div>
        </div>
      )}

      {/* Barra fixa inferior de carrinho no celular (destaque amarelo) */}
      <MobileCartBar
        itemCount={cartItemCount}
        subtotal={cartSubtotal}
        onOpenCart={handleOpenCart}
      />

      {/* Modal compacto de informações comerciais */}
      <StoreInfoModal
        isOpen={isInfoOpen}
        onClose={handleCloseInfo}
        storeStatus={storeStatus}
      />

      {/* Janela de detalhes do produto (bottom sheet no celular / modal no computador) */}
      {detailProduct && (() => {
        const promo = getProductPromoInfo(detailProduct);
        return (
          <ProductDetailModal
            key={detailProduct.id}
            product={detailProduct}
            effectivePrice={promo.currentPrice}
            isBlackFridayPromo={promo.isPromo}
            onClose={handleCloseDetail}
            onCustomize={handleOpenCustomize}
            onAdd={handleQuickAdd}
          />
        );
      })()}

      {/* Modal de Personalização */}
      {customizingProduct && (
        <CustomizationModal
          key={editingCartItem?.cartItemId ?? customizingProduct.id}
          product={customizingProduct}
          effectiveBasePrice={getEffectiveProductPrice(customizingProduct)}
          editingItem={editingCartItem}
          onClose={handleCloseCustomize}
          onSave={handleSaveCustomizedItem}
        />
      )}

      {/* Drawer de Carrinho, Checkout e Comanda */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        cartItems={cartItems}
        checkoutForm={checkoutForm}
        onUpdateCheckoutForm={setCheckoutForm}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onEditItem={handleEditCartItem}
        onClearCart={handleClearCart}
        storeStatus={storeStatus}
      />
    </div>
  );
}
