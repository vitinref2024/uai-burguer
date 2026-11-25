import { memo, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Minus,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { STORE_CONFIG } from '../data/menu';
import { BrandLogo } from './BrandLogo';
import {
  CartItem,
  CheckoutFormData,
  OrderType,
  PaymentMethod,
  StoreStatus,
} from '../types/menu';
import { formatBRL, formatPhoneBR } from '../utils/format';
import {
  calculateCartItemCount,
  calculateCartSubtotal,
  calculateItemTotal,
  calculateItemUnitPrice,
} from '../utils/pricing';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrlFromMessage,
  getPaymentDisplayLabel,
  validateCheckout,
} from '../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  checkoutForm: CheckoutFormData;
  onUpdateCheckoutForm: (next: CheckoutFormData) => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onEditItem: (item: CartItem) => void;
  onClearCart: () => void;
  storeStatus: StoreStatus;
}

type DrawerStep = 'cart' | 'checkout' | 'comanda';

export const CartDrawer = memo(function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  checkoutForm,
  onUpdateCheckoutForm,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  onClearCart,
  storeStatus,
}: CartDrawerProps) {
  const [step, setStep] = useState<DrawerStep>('cart');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const subtotal = useMemo(
    () => (isOpen ? calculateCartSubtotal(cartItems) : 0),
    [isOpen, cartItems]
  );
  const totalItems = useMemo(
    () => (isOpen ? calculateCartItemCount(cartItems) : 0),
    [isOpen, cartItems]
  );

  useEffect(() => {
    if (cartItems.length === 0 && step !== 'cart') {
      setStep('cart');
      setErrors({});
    }
  }, [cartItems.length, step]);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, onClose]);

  const generatedMessage = useMemo(() => {
    if (!isOpen || cartItems.length === 0) return '';
    return buildWhatsAppMessage(cartItems, checkoutForm);
  }, [isOpen, cartItems, checkoutForm]);

  const whatsappUrl = useMemo(() => {
    if (!generatedMessage) return STORE_CONFIG.whatsappBaseUrl;
    return buildWhatsAppUrlFromMessage(generatedMessage);
  }, [generatedMessage]);

  if (!isOpen) return null;

  const setOrderType = (orderType: OrderType) => {
    onUpdateCheckoutForm({ ...checkoutForm, orderType });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.cidade;
      delete next.bairro;
      delete next.rua;
      delete next.numero;
      return next;
    });
  };

  const setPaymentMethod = (paymentMethod: PaymentMethod) => {
    onUpdateCheckoutForm({
      ...checkoutForm,
      paymentMethod,
      needsChange: paymentMethod === 'dinheiro' ? checkoutForm.needsChange : false,
      changeFor: paymentMethod === 'dinheiro' ? checkoutForm.changeFor : '',
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.changeFor;
      return next;
    });
  };

  const handleFieldChange = (
    field: 'customerName' | 'customerPhone' | 'changeFor',
    value: string
  ) => {
    const formatted = field === 'customerPhone' ? formatPhoneBR(value) : value;
    onUpdateCheckoutForm({ ...checkoutForm, [field]: formatted });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAddressChange = (
    field: keyof CheckoutFormData['address'],
    value: string
  ) => {
    onUpdateCheckoutForm({
      ...checkoutForm,
      address: {
        ...checkoutForm.address,
        [field]: value,
      },
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFinalizeSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!storeStatus.isOpen) {
      setErrors({
        schedule: `Estabelecimento fechado no momento. Próximo atendimento: ${storeStatus.nextOpeningText}.`,
      });
      return;
    }

    const validation = validateCheckout(checkoutForm, cartItems);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setStep('comanda');

    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const orderTypes: { id: OrderType; label: string; hint: string }[] = [
    { id: 'delivery', label: 'Delivery', hint: 'Entrega no endereço' },
    { id: 'retirada', label: 'Retirada', hint: 'Retirar na loja' },
    { id: 'consumo_local', label: 'Consumo no local', hint: 'Comer na loja' },
  ];

  const paymentOptions: { id: PaymentMethod; label: string; detail: string }[] = [
    {
      id: 'pix',
      label: 'Pix',
      detail: 'Chave enviada pela hamburgueria no WhatsApp',
    },
    {
      id: 'dinheiro',
      label: 'Dinheiro',
      detail: 'Informe se precisa de troco',
    },
    {
      id: 'cartao',
      label: 'Cartão',
      detail: getPaymentDisplayLabel('cartao', checkoutForm.orderType),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-lg flex-col border-l border-[#262626] bg-[#141414]">
        {/* Cabeçalho do Drawer */}
        <div className="flex items-center justify-between gap-3 border-b border-[#262626] px-5 py-3.5">
          <div className="flex items-center gap-3">
            {step !== 'cart' && (
              <button
                type="button"
                onClick={() => setStep(step === 'comanda' ? 'checkout' : 'cart')}
                aria-label="Voltar para etapa anterior"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#262626] bg-[#1B1B1B] text-[#FFFFFF] transition-colors duration-150 hover:border-[#F5B700]/60 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            )}
            <div>
              <h2
                id="cart-drawer-title"
                className="text-[18px] font-bold text-[#FFFFFF]"
              >
                {step === 'cart' && 'Seu Carrinho'}
                {step === 'checkout' && 'Finalizar Pedido'}
                {step === 'comanda' && 'Comanda Pronta'}
              </h2>
              <p className="text-[12px] text-[#B3B3B3]">
                {step === 'cart' &&
                  `${totalItems} ${totalItems === 1 ? 'item' : 'itens'} · ${formatBRL(subtotal)}`}
                {step === 'checkout' && 'Preencha seus dados para enviar no WhatsApp'}
                {step === 'comanda' && 'Confirme o envio diretamente no WhatsApp'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#262626] bg-[#1B1B1B] text-[#FFFFFF] transition-colors duration-150 hover:border-[#F5B700]/60 cursor-pointer"
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Aviso de estabelecimento fechado no topo do drawer */}
        {!storeStatus.isOpen && (
          <div
            role="status"
            className="border-b border-[#262626] bg-[#1B1B1B] px-5 py-3 text-[12px] text-[#CCCCCC]"
          >
            <div className="flex items-start gap-2.5">
              <Clock
                className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B700]"
                strokeWidth={2}
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-[#FFFFFF]">
                  Estabelecimento fechado no momento
                </p>
                <p className="mt-0.5 text-[#B3B3B3]">
                  Atendimento de quarta a domingo, das 17h30 às 00h. Próximo expediente: {storeStatus.nextOpeningText}. Finalização bloqueada fora do expediente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 1: CARRINHO */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <BrandLogo className="h-16 w-16" alt="Logo Uai Burguer" />
                  <h3 className="mt-4 text-[16px] font-bold text-[#FFFFFF]">
                    Seu carrinho está vazio
                  </h3>
                  <p className="mt-1.5 max-w-xs text-[13px] text-[#B3B3B3]">
                    Escolha um dos nossos hambúrgueres Angus 150g, acompanhamentos ou bebidas no cardápio.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-5 min-h-[44px] rounded-xl bg-[#F5B700] px-5 py-2.5 text-[13.5px] font-bold text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28] cursor-pointer"
                  >
                    Ver cardápio
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const unitPrice = calculateItemUnitPrice(item);
                    const itemTotal = calculateItemTotal(item);
                    const canEdit =
                      item.category === 'hamburgueres' ||
                      item.category === 'monte-do-seu-jeito';

                    return (
                      <article
                        key={item.cartItemId}
                        className="rounded-xl border border-[#262626] bg-[#1B1B1B] p-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-[14px] font-semibold text-[#FFFFFF]">
                              {item.quantity}x {item.name}
                            </h3>
                            <p className="price-num mt-0.5 text-[12px] text-[#8A8A8A]">
                              Unitário: {formatBRL(unitPrice)}
                            </p>
                          </div>
                          <span className="price-num shrink-0 text-[14.5px] font-bold text-[#F5B700]">
                            {formatBRL(itemTotal)}
                          </span>
                        </div>

                        {(item.selectedBread ||
                          item.selectedDoneness ||
                          item.removedIngredients.length > 0 ||
                          item.extras.length > 0 ||
                          item.sauces.length > 0 ||
                          item.observations) && (
                          <ul className="mt-2.5 space-y-1 border-t border-[#262626] pt-2 text-[12px] text-[#B3B3B3]">
                            {item.selectedBread && (
                              <li>Pão: {item.selectedBread}</li>
                            )}
                            {item.selectedDoneness && (
                              <li>Ponto da carne: {item.selectedDoneness}</li>
                            )}
                            {item.removedIngredients.map((ing) => (
                              <li key={`rem-${ing}`} className="text-[#8A8A8A]">
                                Sem {ing}
                              </li>
                            ))}
                            {item.extras.map((extra) => (
                              <li key={`ext-${extra.id}`} className="font-medium text-[#F5B700]">
                                + {extra.quantity}x {extra.name} (
                                {formatBRL(extra.unitPrice * extra.quantity)})
                              </li>
                            ))}
                            {item.sauces.map((sauce) => (
                              <li key={`sau-${sauce.id}`} className="font-medium text-[#F5B700]">
                                + {sauce.quantity}x {sauce.name} (
                                {formatBRL(sauce.unitPrice * sauce.quantity)})
                              </li>
                            ))}
                            {item.observations && (
                              <li className="italic text-[#B3B3B3]">
                                Obs: {item.observations}
                              </li>
                            )}
                          </ul>
                        )}

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#262626] pt-2.5">
                          <div className="inline-flex items-center rounded-xl border border-[#2C2C2C] bg-[#141414]">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                              aria-label={`Diminuir quantidade de ${item.name}`}
                              className="flex h-9 w-9 items-center justify-center text-[#FFFFFF] transition-colors duration-150 hover:text-[#F5B700] rounded-l-xl cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <span className="price-num min-w-[1.5rem] text-center text-[13px] font-bold text-[#FFFFFF]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                              aria-label={`Aumentar quantidade de ${item.name}`}
                              className="flex h-9 w-9 items-center justify-center text-[#F5B700] transition-colors duration-150 hover:text-[#FFCA28] rounded-r-xl cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => onEditItem(item)}
                                aria-label={`Editar personalização de ${item.name}`}
                                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#333333] bg-[#141414] px-2.5 py-1 text-[12px] font-medium text-[#E5E5E5] transition-colors duration-150 hover:border-[#F5B700] hover:text-[#F5B700] cursor-pointer"
                              >
                                <Pencil className="h-3 w-3" aria-hidden="true" />
                                <span>Editar</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.cartItemId)}
                              aria-label={`Remover ${item.name} do carrinho`}
                              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#2C2C2C] bg-[#141414] px-2.5 py-1 text-[12px] font-medium text-[#8A8A8A] transition-colors duration-150 hover:border-red-500/50 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" aria-hidden="true" />
                              <span>Remover</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-[#262626] bg-[#101010] px-5 py-4">
                <div className="space-y-1 text-[13.5px]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#B3B3B3]">Subtotal dos produtos</span>
                    <span className="price-num text-[18px] font-bold text-[#F5B700]">
                      {formatBRL(subtotal)}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#8A8A8A]">
                    Taxa de entrega (quando aplicável) é confirmada diretamente pelo WhatsApp.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="mt-3.5 flex min-h-[46px] w-full items-center justify-center rounded-xl bg-[#F5B700] px-5 py-3 text-[14px] font-bold text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF] cursor-pointer"
                >
                  Continuar para finalização
                </button>
              </div>
            )}
          </>
        )}

        {/* ETAPA 2: CHECKOUT */}
        {step === 'checkout' && (
          <form
            onSubmit={handleFinalizeSubmit}
            noValidate
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {/* Tipo de Pedido */}
              <fieldset>
                <legend className="text-[14px] font-semibold text-[#FFFFFF]">
                  Como deseja receber seu pedido?
                </legend>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  {orderTypes.map((opt) => {
                    const active = checkoutForm.orderType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOrderType(opt.id)}
                        aria-pressed={active}
                        className={`flex min-h-[54px] flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition-colors duration-150 cursor-pointer ${
                          active
                            ? 'border-[#F5B700] bg-[#F5B700]/15 text-[#FFFFFF]'
                            : 'border-[#262626] bg-[#1B1B1B] text-[#B3B3B3] hover:border-[#3A3A3A] hover:text-[#FFFFFF]'
                        }`}
                      >
                        <span className="text-[12px] font-semibold leading-tight">
                          {opt.label}
                        </span>
                        <span className="mt-0.5 text-[10.5px] text-[#8A8A8A]">
                          {opt.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {checkoutForm.orderType === 'retirada' && (
                  <p className="mt-2 text-[12px] text-[#B3B3B3]">
                    Retirada no endereço:{' '}
                    <strong className="text-[#FFFFFF]">{STORE_CONFIG.address}</strong>
                  </p>
                )}

                {checkoutForm.orderType === 'consumo_local' && (
                  <p className="mt-2 text-[12px] text-[#B3B3B3]">
                    Seu pedido será destacado na comanda como{' '}
                    <strong className="text-[#FFFFFF]">CONSUMO NO LOCAL</strong> (
                    {STORE_CONFIG.address}). Não é necessário informar número de mesa.
                  </p>
                )}
              </fieldset>

              {/* Identificação do Cliente */}
              <div className="space-y-3 border-t border-[#262626] pt-4">
                <h3 className="text-[14px] font-semibold text-[#FFFFFF]">
                  Seus dados
                </h3>

                <div>
                  <label
                    htmlFor="checkout-name"
                    className="block text-[12.5px] font-medium text-[#CCCCCC]"
                  >
                    Nome completo *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    autoComplete="name"
                    value={checkoutForm.customerName}
                    onChange={(e) =>
                      handleFieldChange('customerName', e.target.value)
                    }
                    placeholder="Ex: João Silva"
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-[#2C2C2C] bg-[#1B1B1B] px-3.5 py-2 text-[13.5px] text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#F5B700] focus:outline-none"
                  />
                  {errors.customerName && (
                    <p role="alert" className="mt-1 text-[12px] text-red-400">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-[12.5px] font-medium text-[#CCCCCC]"
                  >
                    Telefone (WhatsApp) *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={checkoutForm.customerPhone}
                    onChange={(e) =>
                      handleFieldChange('customerPhone', e.target.value)
                    }
                    placeholder="(16) 99999-9999"
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-[#2C2C2C] bg-[#1B1B1B] px-3.5 py-2 text-[13.5px] text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#F5B700] focus:outline-none"
                  />
                  {errors.customerPhone && (
                    <p role="alert" className="mt-1 text-[12px] text-red-400">
                      {errors.customerPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Endereço (somente Delivery) */}
              {checkoutForm.orderType === 'delivery' && (
                <div className="space-y-3 border-t border-[#262626] pt-4">
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#FFFFFF]">
                      Endereço de entrega
                    </h3>
                    <p className="mt-1 text-[12px] text-[#8A8A8A]">
                      Referências: Santo Antônio da Alegria (entrega grátis) · Itamogi (R$ 3,00) · Zona rural (R$ 3,00). A taxa não é somada aqui e será confirmada no WhatsApp.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="checkout-cidade"
                        className="block text-[12.5px] font-medium text-[#CCCCCC]"
                      >
                        Cidade *
                      </label>
                      <input
                        id="checkout-cidade"
                        type="text"
                        value={checkoutForm.address.cidade}
                        onChange={(e) =>
                          handleAddressChange('cidade', e.target.value)
                        }
                        placeholder="Ex: Santo Antônio da Alegria"
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-[#2C2C2C] bg-[#1B1B1B] px-3.5 py-2 text-[13.5px] text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#F5B700] focus:outline-none"
                      />
                      {errors.cidade && (
                        <p role="alert" className="mt-1 text-[12px] text-red-400">
                          {errors.cidade}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-bairro"
                        className="block text-[12.5px] font-medium text-[#CCCCCC]"
                      >
                        Bairro *
                      </label>
                      <input
                        id="checkout-bairro"
                        type="text"
                        value={checkoutForm.address.bairro}
                        onChange={(e) =>
                          handleAddressChange('bairro', e.target.value)
                        }
                        placeholder="Ex: Centro"
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-[#2C2C2C] bg-[#1B1B1B] px-3.5 py-2 text-[13.5px] text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#F5B700] focus:outline-none"
                      />
                      {errors.bairro && (
                        <p role="alert" className="mt-1 text-[12px] text-red-400">
                          {errors.bairro}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label
                        htmlFor="checkout-rua"
                        className="block text-[12.5px] font-medium text-[#CCCCCC]"
                      >
                        Rua *
                      </label>
                      <input
                        id="checkout-rua"
                        type="text"
                        value={checkoutForm.address.rua}
                        onChange={(e) =>
                          handleAddressChange('rua', e.target.value)
                        }
                        placeholder="Nome da rua"
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-[#2C2C2C] bg-[#1B1B1B] px-3.5 py-2 text-[13.5px] text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#F5B700] focus:outline-none"
                      />
                      {errors.rua && (
                        <p role="alert" className="mt-1 text-[12px] text-red-400">
                          {errors.rua}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-numero"
                        className="block text-[12.5px] font-medium text-[#CCCCCC]"
                      >
                        Número *
                      </label>
                      <input
                        id="checkout-numero"
                        type="text"
                        value={checkoutForm.address.numero}
                        onChange={(e) =>
                          handleAddressChange('numero', e.target.value)
                        }
                        placeholder="Nº"
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-[#2C2C2C] bg-[#1B1B1B] px-3.5 py-2 text-[13.5px] text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#F5B700] focus:outline-none"
                      />
                      {errors.numero && (
                        <p role="alert" className="mt-1 text-[12px] text-red-400">
                          {errors.numero}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="checkout-complemento"
                        className="block text-[12.5px] font-medium text-[#CCCCCC]"
                      >
                        Complemento
                      </label>
                      <input
                        id="checkout-complemento"
                        type="text"
                        value={checkoutForm.address.complemento}
                        onChange={(e) =>
                          handleAddressChange('complemento', e.target.value)
                        }
                        placeholder="Casa, apto, bloco..."
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-[#2C2C2C] bg-[#1B1B1B] px-3.5 py-2 text-[13.5px] text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#F5B700] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-referencia"
                        className="block text-[12.5px] font-medium text-[#CCCCCC]"
                      >
                        Ponto de referência
                      </label>
                      <input
                        id="checkout-referencia"
                        type="text"
                        value={checkoutForm.address.referencia}
                        onChange={(e) =>
                          handleAddressChange('referencia', e.target.value)
                        }
                        placeholder="Ex: Próximo à praça"
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-[#2C2C2C] bg-[#1B1B1B] px-3.5 py-2 text-[13.5px] text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#F5B700] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Forma de Pagamento */}
              <fieldset className="border-t border-[#262626] pt-4">
                <legend className="text-[14px] font-semibold text-[#FFFFFF]">
                  Forma de pagamento
                </legend>
                <div className="mt-2.5 space-y-2">
                  {paymentOptions.map((option) => {
                    const active = checkoutForm.paymentMethod === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPaymentMethod(option.id)}
                        aria-pressed={active}
                        className={`flex min-h-[50px] w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors duration-150 cursor-pointer ${
                          active
                            ? 'border-[#F5B700] bg-[#F5B700]/12'
                            : 'border-[#262626] bg-[#1B1B1B] hover:border-[#3A3A3A]'
                        }`}
                      >
                        <div>
                          <p className="text-[13.5px] font-semibold text-[#FFFFFF]">
                            {option.label}
                          </p>
                          <p className="text-[12px] text-[#B3B3B3]">
                            {option.detail}
                          </p>
                        </div>
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            active
                              ? 'border-[#F5B700] bg-[#F5B700] text-[#0B0B0B]'
                              : 'border-[#404040]'
                          }`}
                        >
                          {active && <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {checkoutForm.paymentMethod === 'pix' && (
                  <p className="mt-2.5 rounded-xl border border-[#262626] bg-[#1B1B1B] p-3 text-[12px] leading-relaxed text-[#B3B3B3]">
                    A chave Pix será enviada pela UAI BURGUER diretamente na conversa do WhatsApp após receber a sua comanda.
                  </p>
                )}

                {checkoutForm.paymentMethod === 'dinheiro' && (
                  <div className="mt-2.5 rounded-xl border border-[#262626] bg-[#1B1B1B] p-3.5">
                    <p className="text-[12.5px] font-semibold text-[#FFFFFF]">
                      Precisa de troco?
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCheckoutForm({
                            ...checkoutForm,
                            needsChange: false,
                            changeFor: '',
                          });
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.changeFor;
                            return next;
                          });
                        }}
                        aria-pressed={!checkoutForm.needsChange}
                        className={`min-h-[42px] rounded-xl border text-[12.5px] font-semibold transition-colors duration-150 cursor-pointer ${
                          !checkoutForm.needsChange
                            ? 'border-[#F5B700] bg-[#F5B700] text-[#0B0B0B]'
                            : 'border-[#2C2C2C] bg-[#141414] text-[#CCCCCC]'
                        }`}
                      >
                        Não
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateCheckoutForm({
                            ...checkoutForm,
                            needsChange: true,
                          })
                        }
                        aria-pressed={checkoutForm.needsChange}
                        className={`min-h-[42px] rounded-xl border text-[12.5px] font-semibold transition-colors duration-150 cursor-pointer ${
                          checkoutForm.needsChange
                            ? 'border-[#F5B700] bg-[#F5B700] text-[#0B0B0B]'
                            : 'border-[#2C2C2C] bg-[#141414] text-[#CCCCCC]'
                        }`}
                      >
                        Sim
                      </button>
                    </div>

                    {checkoutForm.needsChange && (
                      <div className="mt-3">
                        <label
                          htmlFor="checkout-change-for"
                          className="block text-[12.5px] font-medium text-[#CCCCCC]"
                        >
                          Troco para quanto? *
                        </label>
                        <input
                          id="checkout-change-for"
                          type="text"
                          inputMode="decimal"
                          value={checkoutForm.changeFor}
                          onChange={(e) =>
                            handleFieldChange('changeFor', e.target.value)
                          }
                          placeholder="Ex: 100,00"
                          className="mt-1 min-h-[44px] w-full rounded-xl border border-[#2C2C2C] bg-[#141414] px-3 py-2 text-[13.5px] text-[#FFFFFF] placeholder:text-[#737373] focus:border-[#F5B700] focus:outline-none"
                        />
                        {errors.changeFor && (
                          <p role="alert" className="mt-1 text-[12px] text-red-400">
                            {errors.changeFor}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </fieldset>

              {errors.schedule && (
                <p
                  role="alert"
                  className="rounded-xl border border-[#F5B700]/40 bg-[#F5B700]/10 p-3 text-[12px] text-[#F5B700]"
                >
                  {errors.schedule}
                </p>
              )}
            </div>

            {/* Rodapé do Checkout */}
            <div className="border-t border-[#262626] bg-[#101010] px-5 py-4">
              <div className="flex items-baseline justify-between text-[13.5px]">
                <span className="text-[#B3B3B3]">Subtotal dos produtos</span>
                <span className="price-num text-[18px] font-bold text-[#F5B700]">
                  {formatBRL(subtotal)}
                </span>
              </div>
              {checkoutForm.orderType === 'delivery' && (
                <p className="mt-1 text-[12px] text-[#8A8A8A]">
                  Taxa de entrega: a confirmar pelo estabelecimento.
                </p>
              )}

              <button
                type="submit"
                disabled={!storeStatus.isOpen}
                className="mt-3.5 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#F5B700] px-5 py-3 text-[14px] font-bold text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28] disabled:cursor-not-allowed disabled:bg-[#2A2A2A] disabled:text-[#737373] cursor-pointer"
              >
                {storeStatus.isOpen ? (
                  <>
                    <span>Finalizar pedido pelo WhatsApp</span>
                    <ExternalLink className="h-4 w-4 text-[#0B0B0B]" aria-hidden="true" />
                  </>
                ) : (
                  <span>Fechado · Pedidos liberados de qua a dom (17h30–00h)</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ETAPA 3: COMANDA GERADA */}
        {step === 'comanda' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="flex items-start gap-3 rounded-xl border border-[#262626] bg-[#1B1B1B] p-4">
                <BrandLogo className="h-11 w-11" alt="" />
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#FFFFFF]">
                    Comanda preparada para o WhatsApp
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[#B3B3B3]">
                    Caso o WhatsApp não tenha aberto automaticamente, toque no botão abaixo para abrir a conversa com {STORE_CONFIG.whatsappDisplay} e clique em ENVIAR.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[12.5px] font-semibold text-[#CCCCCC]">
                    Resumo da comanda
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex min-h-[36px] items-center gap-1.5 text-[12.5px] font-semibold text-[#F5B700] hover:text-[#FFCA28] cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Copiar comanda</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="mt-2 max-h-[45vh] overflow-auto whitespace-pre-wrap rounded-xl border border-[#262626] bg-[#0B0B0B] p-4 font-sans text-[12.5px] leading-relaxed text-[#E5E5E5]">
                  {generatedMessage}
                </pre>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-[#262626] bg-[#101010] px-5 py-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#F5B700] px-5 py-3 text-[14px] font-bold text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28]"
              >
                <span>Abrir no WhatsApp e Enviar</span>
                <ExternalLink className="h-4 w-4 text-[#0B0B0B]" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={() => {
                  onClearCart();
                  setStep('cart');
                  onClose();
                }}
                className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[#2C2C2C] bg-[#1B1B1B] px-4 py-2 text-[12.5px] font-medium text-[#CCCCCC] transition-colors duration-150 hover:border-[#F5B700] hover:text-[#FFFFFF] cursor-pointer"
              >
                Já enviei — limpar carrinho e iniciar novo pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
