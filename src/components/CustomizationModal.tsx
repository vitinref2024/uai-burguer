import { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import { EXTRAS, MEAT_DONENESS_OPTIONS, SAUCES } from '../data/menu';
import {
  CartItem,
  MeatDoneness,
  MenuProduct,
  SelectedOptionItem,
} from '../types/menu';
import { formatBRL } from '../utils/format';
import { calculateItemUnitPrice } from '../utils/pricing';

interface CustomizationModalProps {
  product: MenuProduct;
  effectiveBasePrice?: number;
  /** Quando presente, edita um item existente no carrinho preservando todas as escolhas anteriores. */
  editingItem?: CartItem | null;
  onClose: () => void;
  onSave: (item: CartItem) => void;
}

export function CustomizationModal({
  product,
  effectiveBasePrice,
  editingItem,
  onClose,
  onSave,
}: CustomizationModalProps) {
  const basePrice = effectiveBasePrice ?? product.price;
  const [imgError, setImgError] = useState(false);

  const [selectedBread, setSelectedBread] = useState<string | undefined>(() => {
    if (editingItem?.selectedBread) return editingItem.selectedBread;
    if (product.breadOptions && product.breadOptions.length > 0) {
      return product.breadOptions[0];
    }
    return undefined;
  });

  const [selectedDoneness, setSelectedDoneness] = useState<MeatDoneness | undefined>(() => {
    if (editingItem?.selectedDoneness) return editingItem.selectedDoneness;
    if (product.allowsMeatDoneness) return 'Ao ponto';
    return undefined;
  });

  const [removedIngredients, setRemovedIngredients] = useState<string[]>(() =>
    editingItem ? [...editingItem.removedIngredients] : []
  );

  const [extraQuantities, setExtraQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (editingItem) {
      editingItem.extras.forEach((extra) => {
        if (extra.quantity > 0) initial[extra.id] = extra.quantity;
      });
    }
    return initial;
  });

  const [sauceQuantities, setSauceQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    if (editingItem) {
      editingItem.sauces.forEach((sauce) => {
        if (sauce.quantity > 0) initial[sauce.id] = sauce.quantity;
      });
    }
    return initial;
  });

  const [observations, setObservations] = useState<string>(
    editingItem?.observations ?? ''
  );
  const [quantity, setQuantity] = useState<number>(editingItem?.quantity ?? 1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const availableExtras = useMemo(
    () => EXTRAS.filter((extra) => extra.available),
    []
  );

  const availableSauces = useMemo(
    () => SAUCES.filter((sauce) => sauce.available),
    []
  );

  const selectedExtrasList: SelectedOptionItem[] = useMemo(
    () =>
      availableExtras
        .filter((extra) => (extraQuantities[extra.id] || 0) > 0)
        .map((extra) => ({
          id: extra.id,
          name: extra.name,
          unitPrice: extra.price,
          quantity: extraQuantities[extra.id],
        })),
    [availableExtras, extraQuantities]
  );

  const selectedSaucesList: SelectedOptionItem[] = useMemo(
    () =>
      availableSauces
        .filter((sauce) => (sauceQuantities[sauce.id] || 0) > 0)
        .map((sauce) => ({
          id: sauce.id,
          name: sauce.name,
          unitPrice: sauce.price,
          quantity: sauceQuantities[sauce.id],
        })),
    [availableSauces, sauceQuantities]
  );

  const unitPrice = useMemo(
    () =>
      calculateItemUnitPrice({
        basePrice,
        extras: selectedExtrasList,
        sauces: selectedSaucesList,
      }),
    [basePrice, selectedExtrasList, selectedSaucesList]
  );

  const totalPrice = useMemo(
    () => Math.round(unitPrice * quantity * 100) / 100,
    [unitPrice, quantity]
  );

  const removableIngredients = useMemo(() => {
    const nonRemovable = new Set(product.nonRemovableIngredients || []);
    return product.ingredients.filter((ing) => !nonRemovable.has(ing));
  }, [product.ingredients, product.nonRemovableIngredients]);

  const fixedIngredients = useMemo(() => {
    const nonRemovable = new Set(product.nonRemovableIngredients || []);
    return product.ingredients.filter((ing) => nonRemovable.has(ing));
  }, [product.ingredients, product.nonRemovableIngredients]);

  const photoSrc = (product.imagem || product.imageUrl || '').trim();
  const hasPhoto = Boolean(photoSrc.length > 0 && !imgError);

  const toggleRemovedIngredient = (ingredient: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((item) => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const adjustOptionQuantity = (
    setter: React.Dispatch<React.SetStateAction<Record<string, number>>>,
    id: string,
    delta: number
  ) => {
    setter((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleConfirm = () => {
    const cartItem: CartItem = {
      cartItemId:
        editingItem?.cartItemId ||
        `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      basePrice,
      quantity,
      selectedBread,
      selectedDoneness,
      removedIngredients,
      extras: selectedExtrasList,
      sauces: selectedSaucesList,
      observations: observations.trim(),
    };
    onSave(cartItem);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-[#262626] bg-[#141414] sm:rounded-2xl">
        {/* Topo fixo do Modal */}
        <div className="flex items-center justify-between gap-4 border-b border-[#262626] px-5 py-3.5 sm:px-6">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[#F5B700]">
              {editingItem ? 'Editar personalização' : 'Personalizar pedido'}
            </p>
            <h2
              id="customizer-title"
              className="truncate text-[18px] font-bold text-[#FFFFFF] sm:text-[20px]"
            >
              {product.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de personalização"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#262626] bg-[#1B1B1B] text-[#FFFFFF] transition-colors duration-150 hover:border-[#F5B700]/60 cursor-pointer"
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Corpo rolável */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {/* Resumo do produto */}
          <div className="flex items-start gap-3.5 rounded-xl border border-[#262626] bg-[#1B1B1B] p-3.5">
            {hasPhoto && (
              <img
                src={photoSrc}
                alt={product.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-16 w-16 shrink-0 rounded-xl border border-[#262626] object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] text-[#8A8A8A]">Preço base</span>
                <span className="price-num text-[15px] font-bold text-[#F5B700]">
                  {formatBRL(basePrice)}
                </span>
              </div>
              {product.description && (
                <p className="mt-1 text-[13px] leading-relaxed text-[#CCCCCC]">
                  {product.description}
                </p>
              )}
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#B3B3B3]">
                Ingredientes: {product.ingredients.join(', ')}.
              </p>
            </div>
          </div>

          {/* 1. Escolha do Pão (somente produtos que permitem escolha) */}
          {product.breadOptions && product.breadOptions.length > 0 && (
            <section className="mt-5 border-t border-[#262626] pt-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[14px] font-semibold text-[#FFFFFF]">
                  Escolha o pão
                </h3>
                <span className="text-[12px] font-semibold text-[#F5B700]">
                  Obrigatório
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.breadOptions.map((bread) => {
                  const isSelected = selectedBread === bread;
                  return (
                    <button
                      key={bread}
                      type="button"
                      onClick={() => setSelectedBread(bread)}
                      aria-pressed={isSelected}
                      className={`flex min-h-[44px] items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] font-medium transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-[#F5B700] bg-[#F5B700]/12 text-[#FFFFFF]'
                          : 'border-[#262626] bg-[#1B1B1B] text-[#B3B3B3] hover:border-[#3A3A3A] hover:text-[#FFFFFF]'
                      }`}
                    >
                      <span>{bread}</span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          isSelected
                            ? 'border-[#F5B700] bg-[#F5B700] text-[#0B0B0B]'
                            : 'border-[#404040]'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* 2. Ponto da Carne (exclusivo Monte do Seu Jeito) */}
          {product.allowsMeatDoneness && (
            <section className="mt-5 border-t border-[#262626] pt-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[14px] font-semibold text-[#FFFFFF]">
                  Ponto da carne
                </h3>
                <span className="text-[12px] font-semibold text-[#F5B700]">
                  Obrigatório
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {MEAT_DONENESS_OPTIONS.map((doneness) => {
                  const isSelected = selectedDoneness === doneness;
                  return (
                    <button
                      key={doneness}
                      type="button"
                      onClick={() => setSelectedDoneness(doneness)}
                      aria-pressed={isSelected}
                      className={`flex min-h-[44px] items-center justify-between rounded-xl border px-3 py-2 text-[13px] font-medium transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-[#F5B700] bg-[#F5B700]/12 text-[#FFFFFF]'
                          : 'border-[#262626] bg-[#1B1B1B] text-[#B3B3B3] hover:border-[#3A3A3A] hover:text-[#FFFFFF]'
                      }`}
                    >
                      <span>{doneness}</span>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          isSelected
                            ? 'border-[#F5B700] bg-[#F5B700] text-[#0B0B0B]'
                            : 'border-[#404040]'
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden="true" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* 3. Ingredientes inclusos e opção de retirar */}
          {product.ingredients.length > 0 && (
            <section className="mt-5 border-t border-[#262626] pt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[14px] font-semibold text-[#FFFFFF]">
                  Retirar ingredientes
                </h3>
                <span className="text-[12px] text-[#8A8A8A]">
                  Retirar itens não altera o preço
                </span>
              </div>

              {fixedIngredients.length > 0 && (
                <p className="mt-1.5 text-[12px] text-[#8A8A8A]">
                  Base incluída: {fixedIngredients.join(' · ')}
                </p>
              )}

              <div className="mt-2.5 divide-y divide-[#262626] rounded-xl border border-[#262626] bg-[#1B1B1B]">
                {removableIngredients.map((ingredient) => {
                  const isRemoved = removedIngredients.includes(ingredient);
                  return (
                    <div
                      key={ingredient}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                    >
                      <span
                        className={`text-[13.5px] ${
                          isRemoved
                            ? 'text-[#737373] line-through'
                            : 'text-[#FFFFFF]'
                        }`}
                      >
                        {ingredient}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleRemovedIngredient(ingredient)}
                        aria-pressed={isRemoved}
                        aria-label={
                          isRemoved
                            ? `Manter ${ingredient}`
                            : `Retirar ${ingredient}`
                        }
                        className={`min-h-[36px] rounded-lg border px-3 py-1 text-[12px] font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                          isRemoved
                            ? 'border-[#F5B700] bg-[#F5B700]/15 text-[#F5B700]'
                            : 'border-[#333333] bg-[#141414] text-[#CCCCCC] hover:border-[#F5B700] hover:text-[#F5B700]'
                        }`}
                      >
                        {isRemoved ? 'Retirado (Desfazer)' : 'Retirar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 4. Adicionais disponíveis (permite múltiplos e repetição) */}
          <section className="mt-5 border-t border-[#262626] pt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[14px] font-semibold text-[#FFFFFF]">
                Adicionais
              </h3>
              <span className="text-[12px] text-[#8A8A8A]">
                Opcional · Você pode repetir itens
              </span>
            </div>

            <div className="mt-2.5 divide-y divide-[#262626] rounded-xl border border-[#262626] bg-[#1B1B1B]">
              {availableExtras.map((extra) => {
                const qty = extraQuantities[extra.id] || 0;
                return (
                  <div
                    key={extra.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[#FFFFFF]">
                        {extra.name}
                      </p>
                      <p className="price-num text-[12px] font-bold text-[#F5B700]">
                        + {formatBRL(extra.price)}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          adjustOptionQuantity(setExtraQuantities, extra.id, -1)
                        }
                        disabled={qty === 0}
                        aria-label={`Remover adicional ${extra.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-[#141414] text-[#FFFFFF] transition-colors duration-150 hover:border-[#F5B700] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span
                        className={`price-num min-w-[1.5rem] text-center text-[13.5px] font-semibold ${
                          qty > 0 ? 'text-[#F5B700]' : 'text-[#8A8A8A]'
                        }`}
                      >
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          adjustOptionQuantity(setExtraQuantities, extra.id, 1)
                        }
                        aria-label={`Adicionar ${extra.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5B700] text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28] cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. Molhos disponíveis (permite múltiplos e repetição) */}
          <section className="mt-5 border-t border-[#262626] pt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[14px] font-semibold text-[#FFFFFF]">
                Molhos extras
              </h3>
              <span className="text-[12px] text-[#8A8A8A]">
                Opcional · Você pode repetir itens
              </span>
            </div>

            <div className="mt-2.5 divide-y divide-[#262626] rounded-xl border border-[#262626] bg-[#1B1B1B]">
              {availableSauces.map((sauce) => {
                const qty = sauceQuantities[sauce.id] || 0;
                return (
                  <div
                    key={sauce.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[#FFFFFF]">
                        {sauce.name}
                      </p>
                      <p className="price-num text-[12px] font-bold text-[#F5B700]">
                        + {formatBRL(sauce.price)}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          adjustOptionQuantity(setSauceQuantities, sauce.id, -1)
                        }
                        disabled={qty === 0}
                        aria-label={`Remover molho ${sauce.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#333333] bg-[#141414] text-[#FFFFFF] transition-colors duration-150 hover:border-[#F5B700] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span
                        className={`price-num min-w-[1.5rem] text-center text-[13.5px] font-semibold ${
                          qty > 0 ? 'text-[#F5B700]' : 'text-[#8A8A8A]'
                        }`}
                      >
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          adjustOptionQuantity(setSauceQuantities, sauce.id, 1)
                        }
                        aria-label={`Adicionar molho ${sauce.name}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5B700] text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28] cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. Observações */}
          <section className="mt-5 border-t border-[#262626] pt-4">
            <label
              htmlFor="item-observations"
              className="block text-[14px] font-semibold text-[#FFFFFF]"
            >
              Observações
            </label>
            <p className="mt-0.5 text-[12px] text-[#8A8A8A]">
              Ex: molho separado, cortar ao meio, pão mais dourado.
            </p>
            <textarea
              id="item-observations"
              rows={2}
              maxLength={240}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Alguma observação especial para este lanche?"
              className="mt-2 w-full rounded-xl border border-[#262626] bg-[#1B1B1B] px-3.5 py-2.5 text-[13.5px] text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#F5B700] focus:outline-none"
            />
          </section>
        </div>

        {/* Rodapé fixo com Quantidade e Total em tempo real */}
        <div className="border-t border-[#262626] bg-[#101010] px-5 py-3.5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <span className="text-[12.5px] font-medium text-[#B3B3B3]">
                Quantidade
              </span>
              <div className="inline-flex items-center rounded-xl border border-[#262626] bg-[#1B1B1B]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Diminuir quantidade do produto"
                  className="flex h-11 w-11 items-center justify-center text-[#FFFFFF] transition-colors duration-150 hover:text-[#F5B700] disabled:opacity-35 rounded-l-xl cursor-pointer"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="price-num min-w-[2rem] text-center text-[14px] font-bold text-[#FFFFFF]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  aria-label="Aumentar quantidade do produto"
                  className="flex h-11 w-11 items-center justify-center text-[#F5B700] transition-colors duration-150 hover:text-[#FFCA28] rounded-r-xl cursor-pointer"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex min-h-[46px] flex-1 items-center justify-between gap-4 rounded-xl bg-[#F5B700] px-5 py-3 text-[14px] font-bold text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF] sm:max-w-xs cursor-pointer"
            >
              <span>
                {editingItem ? 'Salvar alterações' : 'Adicionar ao carrinho'}
              </span>
              <span className="price-num font-bold text-[#0B0B0B]">
                {formatBRL(totalPrice)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
