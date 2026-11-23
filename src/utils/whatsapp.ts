import { getProductById, STORE_CONFIG } from '../data/menu';
import {
  CartItem,
  CheckoutFormData,
  OrderType,
  PaymentMethod,
} from '../types/menu';
import { formatBRL, parseBRLInput } from './format';
import { calculateCartSubtotal, calculateItemUnitPrice } from './pricing';

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Retorna o rótulo oficial do tipo de pedido para exibição e comanda.
 */
export function getOrderTypeLabel(orderType: OrderType): string {
  switch (orderType) {
    case 'delivery':
      return 'DELIVERY';
    case 'retirada':
      return 'RETIRADA';
    case 'consumo_local':
      return 'CONSUMO NO LOCAL';
  }
}

/**
 * Retorna a descrição adequada da forma de pagamento conforme o tipo de pedido.
 */
export function getPaymentDisplayLabel(
  paymentMethod: PaymentMethod,
  orderType: OrderType
): string {
  switch (paymentMethod) {
    case 'pix':
      return 'Pix (chave enviada pelo WhatsApp após confirmação)';
    case 'dinheiro':
      return 'Dinheiro';
    case 'cartao':
      return orderType === 'delivery'
        ? 'Cartão na entrega'
        : 'Cartão presencialmente no estabelecimento';
  }
}

/**
 * Valida todos os campos obrigatórios do checkout antes de gerar a comanda.
 */
export function validateCheckout(
  form: CheckoutFormData,
  cartItems: CartItem[]
): CheckoutValidationResult {
  const errors: Record<string, string> = {};

  if (cartItems.length === 0) {
    errors.cart = 'Adicione pelo menos um produto ao carrinho.';
  }

  if (!form.customerName.trim() || form.customerName.trim().length < 2) {
    errors.customerName = 'Informe seu nome completo.';
  }

  const phoneDigits = form.customerPhone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    errors.customerPhone = 'Informe um telefone válido com DDD.';
  }

  if (form.orderType === 'delivery') {
    if (!form.address.cidade.trim()) {
      errors.cidade = 'Informe a cidade.';
    }
    if (!form.address.bairro.trim()) {
      errors.bairro = 'Informe o bairro.';
    }
    if (!form.address.rua.trim()) {
      errors.rua = 'Informe a rua.';
    }
    if (!form.address.numero.trim()) {
      errors.numero = 'Informe o número.';
    }
  }

  if (form.paymentMethod === 'dinheiro' && form.needsChange) {
    const subtotal = calculateCartSubtotal(cartItems);
    const parsedChange = parseBRLInput(form.changeFor);
    if (parsedChange === null) {
      errors.changeFor = 'Informe para qual valor precisa de troco.';
    } else if (parsedChange < subtotal) {
      errors.changeFor = `O valor do troco deve ser igual ou maior que ${formatBRL(subtotal)}.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Monta a mensagem formatada da comanda para envio pelo WhatsApp,
 * seguindo rigorosamente o modelo oficial da UAI BURGUER.
 */
export function buildWhatsAppMessage(
  cartItems: CartItem[],
  form: CheckoutFormData
): string {
  const lines: string[] = [];
  const orderTypeLabel = getOrderTypeLabel(form.orderType);
  const subtotal = calculateCartSubtotal(cartItems);

  lines.push(STORE_CONFIG.name);
  lines.push(STORE_CONFIG.slogan.toUpperCase());
  lines.push('');
  lines.push('========================');
  lines.push('');
  if (form.orderType === 'consumo_local') {
    lines.push('PEDIDO: *** CONSUMO NO LOCAL ***');
  } else {
    lines.push(`PEDIDO: ${orderTypeLabel}`);
  }
  lines.push('');
  lines.push(`CLIENTE: ${form.customerName.trim()}`);
  lines.push(`TELEFONE: ${form.customerPhone.trim()}`);
  lines.push('');
  lines.push('PRODUTOS:');
  lines.push('');

  cartItems.forEach((item, index) => {
    const unitBaseFormatted = formatBRL(item.basePrice);
    lines.push(`${item.quantity}x ${item.name} — ${unitBaseFormatted}`);

    const product = getProductById(item.productId);
    if (product?.category === 'combos' && product.description) {
      lines.push(`- ${product.description}`);
    }

    const personalizationLines: string[] = [];

    if (item.selectedBread) {
      personalizationLines.push(`- Pão: ${item.selectedBread}.`);
    }

    if (item.selectedDoneness) {
      personalizationLines.push(`- Ponto da carne: ${item.selectedDoneness}.`);
    }

    item.removedIngredients.forEach((ingredient) => {
      personalizationLines.push(`- Sem ${ingredient}.`);
    });

    item.extras.forEach((extra) => {
      if (extra.quantity > 0) {
        const extraTotal = extra.unitPrice * extra.quantity;
        const prefix = extra.quantity > 1 ? `${extra.quantity}x ` : '';
        personalizationLines.push(
          `- Adicional de ${prefix}${extra.name}: ${formatBRL(extraTotal)}.`
        );
      }
    });

    item.sauces.forEach((sauce) => {
      if (sauce.quantity > 0) {
        const sauceTotal = sauce.unitPrice * sauce.quantity;
        const prefix = sauce.quantity > 1 ? `${sauce.quantity}x ` : '';
        personalizationLines.push(
          `- ${prefix}${sauce.name}: ${formatBRL(sauceTotal)}.`
        );
      }
    });

    if (personalizationLines.length > 0) {
      lines.push('');
      lines.push('Personalização:');
      personalizationLines.forEach((pLine) => lines.push(pLine));
    }

    if (item.observations.trim()) {
      lines.push('');
      lines.push('Observações:');
      lines.push(`- ${item.observations.trim()}`);
    }

    const unitTotal = calculateItemUnitPrice(item);
    if (unitTotal !== item.basePrice || item.quantity > 1) {
      const itemTotal = unitTotal * item.quantity;
      lines.push(`Subtotal do item: ${formatBRL(itemTotal)}`);
    }

    if (index < cartItems.length - 1) {
      lines.push('');
    }
  });

  lines.push('');
  lines.push('========================');
  lines.push('');

  // Endereço somente para Delivery (nunca exibir campos vazios na retirada ou consumo local)
  if (form.orderType === 'delivery') {
    lines.push('ENDEREÇO:');
    lines.push(`Cidade: ${form.address.cidade.trim()}`);
    lines.push(`Bairro: ${form.address.bairro.trim()}`);
    lines.push(`Rua: ${form.address.rua.trim()}`);
    lines.push(`Número: ${form.address.numero.trim()}`);
    if (form.address.complemento.trim()) {
      lines.push(`Complemento: ${form.address.complemento.trim()}`);
    }
    if (form.address.referencia.trim()) {
      lines.push(`Referência: ${form.address.referencia.trim()}`);
    }
    lines.push('');
  } else if (form.orderType === 'retirada') {
    lines.push(`RETIRADA NO LOCAL: ${STORE_CONFIG.address}`);
    lines.push('');
  } else {
    lines.push('ATENDIMENTO: CONSUMO NO LOCAL');
    lines.push('');
  }

  // Pagamento
  if (form.paymentMethod === 'pix') {
    lines.push('PAGAMENTO: Pix');
    lines.push('Pagamento via Pix a combinar pelo WhatsApp após confirmação.');
  } else if (form.paymentMethod === 'cartao') {
    lines.push(
      `PAGAMENTO: ${getPaymentDisplayLabel('cartao', form.orderType)}`
    );
  } else {
    lines.push('PAGAMENTO: Dinheiro');
    lines.push(`TROCO: ${form.needsChange ? 'Sim' : 'Não'}`);
    if (form.needsChange) {
      const parsedChange = parseBRLInput(form.changeFor);
      const formattedChange =
        parsedChange !== null ? formatBRL(parsedChange) : form.changeFor.trim();
      lines.push(`TROCO PARA: ${formattedChange}`);
    }
  }

  lines.push('');
  lines.push(`SUBTOTAL DOS PRODUTOS: ${formatBRL(subtotal)}`);
  if (form.orderType === 'delivery') {
    lines.push('TAXA DE ENTREGA: A confirmar pelo estabelecimento.');
  }
  lines.push('');
  lines.push('========================');
  lines.push('');
  lines.push('Aguardamos a confirmação do pedido!');

  return lines.join('\n');
}

/**
 * Gera a URL oficial do WhatsApp da UAI BURGUER com a mensagem devidamente codificada.
 */
export function buildWhatsAppUrl(
  cartItems: CartItem[],
  form: CheckoutFormData
): string {
  const message = buildWhatsAppMessage(cartItems, form);
  return buildWhatsAppUrlFromMessage(message);
}

export function buildWhatsAppUrlFromMessage(message: string): string {
  return `${STORE_CONFIG.whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
}
