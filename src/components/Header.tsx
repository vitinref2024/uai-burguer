import { ShoppingBag } from 'lucide-react';
import { STORE_CONFIG } from '../data/menu';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  cartItemCount: number;
  cartBump: boolean;
  onOpenCart: () => void;
}

/**
 * Topo compacto da Uai Burguer:
 * Logo oficial circular e slogan discreto "Aqui o Burguer é Angus"
 * e botão do carrinho com contador em destaque amarelo.
 */
export function Header({ cartItemCount, cartBump, onOpenCart }: HeaderProps) {
  return (
    <header className="bg-[#0B0B0B]">
      <div className="mx-auto max-w-[1040px] px-4 pb-2 pt-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo oficial circular + Nome + Slogan */}
          <a
            href="#topo"
            className="flex items-center gap-3 min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700]"
          >
            <BrandLogo
              className="h-11 w-11 sm:h-12 sm:w-12"
              alt="Logo Uai Burguer"
            />

            <div className="min-w-0">
              <span className="block truncate text-[17px] font-bold leading-tight tracking-tight text-[#FFFFFF]">
                {STORE_CONFIG.displayName}
              </span>
              <span className="block truncate text-[12px] leading-tight text-[#B3B3B3]">
                {STORE_CONFIG.sloganCompact}
              </span>
            </div>
          </a>

          {/* Botão do Carrinho com destaque amarelo */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={
              cartItemCount > 0
                ? `Abrir carrinho com ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'itens'}`
                : 'Abrir carrinho de pedidos'
            }
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#262626] bg-[#141414] px-3.5 py-2 text-[13px] font-semibold text-[#FFFFFF] transition-colors duration-150 hover:border-[#F5B700]/60 hover:bg-[#1B1B1B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag
              className="h-4 w-4 text-[#F5B700]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Carrinho</span>
            <span
              data-testid="header-cart-count"
              className={`price-num inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold transition-transform duration-150 ${
                cartBump ? 'scale-125' : 'scale-100'
              } ${
                cartItemCount > 0
                  ? 'bg-[#F5B700] text-[#0B0B0B]'
                  : 'bg-[#222222] text-[#B3B3B3]'
              }`}
            >
              {cartItemCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
