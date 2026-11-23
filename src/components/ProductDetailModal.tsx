import { useEffect } from 'react';
import { Plus, SlidersHorizontal, X } from 'lucide-react';
import { MenuProduct } from '../types/menu';
import { formatBRL } from '../utils/format';
import { ProductThumbnail } from './ProductThumbnail';

interface ProductDetailModalProps {
  product: MenuProduct;
  onClose: () => void;
  onCustomize: (product: MenuProduct) => void;
  onAdd: (product: MenuProduct) => void;
}

/**
 * Janela de visualização rápida do produto (bottom sheet no celular, modal no computador):
 * exibe imagem maior (ou placeholder maior em proporção 1:1), nome, ingredientes completos,
 * preço em destaque amarelo e os botões "Personalizar" e "Adicionar".
 */
export function ProductDetailModal({
  product,
  onClose,
  onCustomize,
  onAdd,
}: ProductDetailModalProps) {
  const isCustomizable = Boolean(product.customizable);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-[#262626] bg-[#141414] sm:rounded-2xl">
        {/* Topo com botão fechar */}
        <div className="flex items-center justify-between gap-3 border-b border-[#262626] px-5 py-3">
          <span className="text-[13px] font-medium text-[#B3B3B3]">
            Detalhes do produto
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes do produto"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#262626] bg-[#1B1B1B] text-[#FFFFFF] transition-colors duration-150 hover:border-[#F5B700]/60 cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Corpo rolável */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mx-auto w-full max-w-[240px]">
            <ProductThumbnail
              name={product.name}
              category={product.category}
              imagem={product.imagem}
              imageUrl={product.imageUrl}
              size="modal"
              className="w-full"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2
                id="product-detail-title"
                className="text-[18px] font-bold text-[#FFFFFF]"
              >
                {product.name}
              </h2>
              <span className="price-num shrink-0 text-[18px] font-bold text-[#F5B700]">
                {formatBRL(product.price)}
              </span>
            </div>

            {product.breadOptions && product.breadOptions.length > 0 && (
              <p className="mt-2 text-[13px] font-medium text-[#F5B700]">
                Opções de pão: {product.breadOptions.join(' ou ')}
              </p>
            )}

            {product.allowsMeatDoneness && (
              <p className="mt-1 text-[13px] font-medium text-[#F5B700]">
                Ponto da carne: Bem passada, Ao ponto ou Mal passada
              </p>
            )}

            {product.description && (
              <p className="mt-2.5 text-[14px] leading-relaxed text-[#CCCCCC]">
                {product.description}
              </p>
            )}

            {product.ingredients.length > 0 && (
              <div className="mt-3 rounded-xl border border-[#262626] bg-[#1B1B1B] px-3.5 py-3">
                <p className="text-[12px] font-semibold text-[#F5B700]">
                  Ingredientes completos
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#D4D4D4]">
                  {product.ingredients.join(', ')}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ações inferiores */}
        <div className="border-t border-[#262626] bg-[#101010] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            {isCustomizable && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCustomize(product);
                }}
                className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#333333] bg-[#1B1B1B] px-4 py-2.5 text-[14px] font-semibold text-[#FFFFFF] transition-colors duration-150 hover:border-[#F5B700] hover:text-[#F5B700] cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>Personalizar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onAdd(product);
                onClose();
              }}
              className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#F5B700] px-4 py-2.5 text-[14px] font-bold text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28] cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#0B0B0B]" strokeWidth={2.5} aria-hidden="true" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
