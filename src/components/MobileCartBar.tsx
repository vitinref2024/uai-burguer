import { ShoppingBag } from 'lucide-react';
import { formatBRL } from '../utils/format';

interface MobileCartBarProps {
  itemCount: number;
  subtotal: number;
  onOpenCart: () => void;
}

/**
 * Barra inferior fixa no celular exibida somente quando houver produtos no carrinho.
 * Formato: "Ver carrinho · X itens · R$ total" com destaque amarelo (#F5B700) e texto preto.
 */
export function MobileCartBar({
  itemCount,
  subtotal,
  onOpenCart,
}: MobileCartBarProps) {
  if (itemCount === 0) return null;

  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} itens`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#262626] bg-[#0B0B0B]/95 px-4 py-2.5 backdrop-blur-sm md:hidden">
      <button
        type="button"
        onClick={onOpenCart}
        aria-label={`Ver carrinho · ${itemLabel} · ${formatBRL(subtotal)}`}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#F5B700] px-4 py-3 text-[14px] font-bold text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28] active:bg-[#E0A800] cursor-pointer"
      >
        <ShoppingBag
          className="h-4 w-4 shrink-0 text-[#0B0B0B]"
          strokeWidth={2.25}
          aria-hidden="true"
        />
        <span>Ver carrinho</span>
        <span aria-hidden="true" className="text-[#0B0B0B]/60">
          ·
        </span>
        <span className="price-num">{itemLabel}</span>
        <span aria-hidden="true" className="text-[#0B0B0B]/60">
          ·
        </span>
        <span className="price-num font-bold text-[#0B0B0B]">
          {formatBRL(subtotal)}
        </span>
      </button>
    </div>
  );
}
