import { ArrowDown, Clock, Plus } from 'lucide-react';
import { MenuProduct } from '../types/menu';
import { formatBRL } from '../utils/format';
import { BLACK_FRIDAY_COMBO_PRICE } from '../utils/promotions';
import { ProductThumbnail } from './ProductThumbnail';

interface BlackFridaySectionProps {
  combos: MenuProduct[];
  productQuantities: Record<string, number>;
  onExploreOffers: () => void;
  onOpenDetail: (product: MenuProduct) => void;
  onQuickAdd: (product: MenuProduct) => void;
}

/**
 * Seção especial de Black Friday exibida logo abaixo do cabeçalho
 * e antes das categorias do cardápio exclusivamente em 27/11/2026.
 */
export function BlackFridaySection({
  combos,
  productQuantities,
  onExploreOffers,
  onOpenDetail,
  onQuickAdd,
}: BlackFridaySectionProps) {
  if (combos.length === 0) return null;

  return (
    <section
      id="black-friday"
      aria-labelledby="black-friday-heading"
      data-testid="black-friday-section"
      className="border-y border-[#F5B700]/35 bg-[#0B0B0B]"
    >
      <div className="mx-auto max-w-[1040px] px-4 py-5 sm:py-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#F5B700]/45 bg-gradient-to-br from-[#191408] via-[#121212] to-[#0B0B0B] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.65)] sm:p-6">
          {/* Detalhe sutil dourado no topo interno */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5B700] to-transparent"
          />

          {/* Cabeçalho da campanha + Selo de urgência + CTA */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5B700] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#0B0B0B]">
                  <Clock className="h-3.5 w-3.5 text-[#0B0B0B]" strokeWidth={2.5} aria-hidden="true" />
                  <span>SOMENTE HOJE!</span>
                </span>
                <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#F5B700]">
                  OFERTAS ESPECIAIS — SOMENTE HOJE!
                </span>
              </div>

              <h2
                id="black-friday-heading"
                className="mt-2.5 text-[22px] font-black leading-tight tracking-tight text-[#FFFFFF] sm:text-[26px]"
              >
                🔥 BLACK FRIDAY UAI BURGUER
              </h2>

              <p className="mt-1 text-[13.5px] text-[#CCCCCC]">
                Os três combos selecionados por{' '}
                <strong className="price-num font-extrabold text-[#F5B700]">
                  {formatBRL(BLACK_FRIDAY_COMBO_PRICE)}
                </strong>{' '}
                cada no pedido direto pelo cardápio e WhatsApp.
              </p>
            </div>

            <button
              type="button"
              onClick={onExploreOffers}
              className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F5B700] px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.06em] text-[#0B0B0B] shadow-[0_10px_28px_rgba(245,183,0,0.22)] transition-all duration-150 hover:bg-[#FFCA28] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF] cursor-pointer"
            >
              <span>APROVEITAR OFERTAS</span>
              <ArrowDown className="h-4 w-4 text-[#0B0B0B]" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>

          {/* Grid dos 3 combos promocionais */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {combos.map((combo) => {
              const qtyInCart = productQuantities[combo.id] || 0;
              return (
                <article
                  key={combo.id}
                  data-testid={`black-friday-card-${combo.id}`}
                  className="flex flex-col justify-between rounded-xl border border-[#F5B700]/30 bg-[#141414]/95 p-3.5 transition-colors duration-150 hover:border-[#F5B700]/75"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(combo)}
                      aria-label={`Ver detalhes de ${combo.name}`}
                      className="h-20 w-20 shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700] cursor-pointer"
                    >
                      <ProductThumbnail
                        name={combo.name}
                        category={combo.category}
                        imagem={combo.imagem}
                        imageUrl={combo.imageUrl}
                        size="card"
                        className="h-full w-full border-[#F5B700]/30"
                      />
                    </button>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(combo)}
                        className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B700] rounded cursor-pointer"
                      >
                        <h3 className="text-[15px] font-bold leading-snug text-[#FFFFFF]">
                          {combo.name}
                        </h3>
                      </button>

                      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="price-num text-[12px] font-medium text-[#8A8A8A] line-through">
                          de {formatBRL(combo.price)}
                        </span>
                        <span className="price-num text-[18px] font-black leading-none text-[#F5B700]">
                          {formatBRL(BLACK_FRIDAY_COMBO_PRICE)}
                        </span>
                      </div>

                      {qtyInCart > 0 && (
                        <p className="price-num mt-1 text-[11.5px] font-semibold text-[#F5B700]">
                          {qtyInCart} no carrinho
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#262626] pt-2.5">
                    <span className="text-[11px] font-medium text-[#B3B3B3]">
                      Hambúrguer + batata + refri
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuickAdd(combo)}
                      aria-label={`Adicionar ${combo.name} por ${formatBRL(BLACK_FRIDAY_COMBO_PRICE)}`}
                      className="inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-lg bg-[#F5B700] px-3 py-1.5 text-[12px] font-extrabold text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFFFFF] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
