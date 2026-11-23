import { memo } from 'react';
import { Plus } from 'lucide-react';
import { MenuProduct } from '../types/menu';
import { formatBRL } from '../utils/format';
import { ProductThumbnail } from './ProductThumbnail';

interface ProductCardProps {
  product: MenuProduct;
  quantityInCart: number;
  onOpenDetail: (product: MenuProduct) => void;
  onCustomize?: (product: MenuProduct) => void;
  onQuickAdd: (product: MenuProduct) => void;
}

/**
 * Card de produto mobile-first em tema escuro comercial:
 * - Esquerda: nome em branco negrito (16px), ingredientes em até 2 linhas (13px, cinza claro),
 *   preço em amarelo (#F5B700) e botão contornado "Personalizar" (13px).
 * - Direita: área de imagem 1:1 fixa (96x96px celular / 120x120px computador) com
 *   botão "+" redondo (36px) em amarelo destaque (#F5B700) sobreposto no canto inferior direito.
 */
export const ProductCard = memo(function ProductCard({
  product,
  quantityInCart,
  onOpenDetail,
  onCustomize,
  onQuickAdd,
}: ProductCardProps) {
  const isCustomizable = Boolean(product.customizable);

  const summaryText =
    product.ingredients.length > 0
      ? `${product.ingredients.join(', ')}.`
      : product.description || '';

  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="flex h-full items-stretch justify-between gap-3 rounded-xl border border-[#262626] bg-[#141414] p-3.5 transition-colors duration-150 hover:border-[#F5B700]/45 sm:gap-4 sm:p-4"
    >
      {/* Coluna Esquerda: Texto + Preço + Personalizar */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          aria-label={`Ver detalhes de ${product.name}`}
          className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700] rounded-md cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold leading-snug text-[#FFFFFF]">
              {product.name}
            </h3>
            {product.featured && (
              <span className="shrink-0 rounded bg-[#F5B700]/15 px-1.5 py-0.5 text-[10.5px] font-semibold text-[#F5B700]">
                Destaque
              </span>
            )}
          </div>

          {summaryText && (
            <p className="mt-1 line-clamp-2 text-[13px] leading-[1.45] text-[#B3B3B3]">
              {summaryText}
            </p>
          )}
        </button>

        {/* Preço em destaque amarelo + botão contornado Personalizar */}
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <div className="flex items-baseline gap-1">
            {product.id === 'monte-do-seu-jeito' && (
              <span className="text-[11.5px] text-[#8A8A8A]">A partir de</span>
            )}
            <span className="price-num text-[15.5px] font-bold text-[#F5B700]">
              {formatBRL(product.price)}
            </span>
          </div>

          {isCustomizable && onCustomize && (
            <button
              type="button"
              onClick={() => onCustomize(product)}
              aria-label={`Personalizar ${product.name}`}
              className="inline-flex min-h-[36px] items-center rounded-lg border border-[#333333] bg-[#1B1B1B] px-2.5 py-1 text-[13px] font-medium text-[#E5E5E5] transition-colors duration-150 hover:border-[#F5B700] hover:text-[#F5B700] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700] whitespace-nowrap cursor-pointer"
            >
              {quantityInCart > 0
                ? `Personalizar (${quantityInCart})`
                : 'Personalizar'}
            </button>
          )}

          {!isCustomizable && quantityInCart > 0 && (
            <span className="price-num text-[12px] font-semibold text-[#F5B700]">
              {quantityInCart} no carrinho
            </span>
          )}
        </div>
      </div>

      {/* Coluna Direita: Imagem quadrada 96px (mobile) / 120px (desktop) + Botão "+" amarelo */}
      <div className="relative h-24 w-24 shrink-0 self-center md:h-[120px] md:w-[120px]">
        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          aria-label={`Ampliar detalhes de ${product.name}`}
          className="block h-full w-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700] cursor-pointer"
        >
          <ProductThumbnail
            name={product.name}
            category={product.category}
            imagem={product.imagem}
            imageUrl={product.imageUrl}
            size="card"
            className="h-full w-full"
          />
        </button>

        {/* Botão "+" redondo 36px em amarelo destaque (#F5B700) com área de toque >= 44px */}
        <button
          type="button"
          onClick={() => onQuickAdd(product)}
          aria-label={`Adicionar ${product.name} ao carrinho`}
          className="absolute bottom-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#F5B700] text-[#0B0B0B] shadow-md transition-transform duration-150 hover:bg-[#FFCA28] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF] after:absolute after:-inset-1 after:content-[''] cursor-pointer"
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
});
