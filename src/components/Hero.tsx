import { Clock, MapPin, Phone, SlidersHorizontal, ArrowDown } from 'lucide-react';
import { STORE_CONFIG } from '../data/menu';
import { StoreStatus } from '../types/menu';

interface HeroProps {
  storeStatus: StoreStatus;
  onExploreMenu: () => void;
  onOpenCustomBurger: () => void;
}

export function Hero({
  storeStatus,
  onExploreMenu,
  onOpenCustomBurger,
}: HeroProps) {
  return (
    <section
      id="topo"
      className="relative border-b border-white/[0.08] bg-[#0A0A0A]"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8 lg:py-12">
        <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Coluna Principal Editorial */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-xs font-medium tracking-wide text-[#D4AF37]">
              Hamburgueria Artesanal · Carne Angus 150g
            </p>

            <h1 className="mt-2.5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-[#F5F5F4] [text-wrap:balance] sm:text-5xl lg:text-[3.25rem]">
              {STORE_CONFIG.name}
            </h1>

            <p className="mt-2.5 font-display text-xl italic text-[#D4AF37] sm:text-2xl">
              {STORE_CONFIG.slogan}
            </p>

            <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-[#B5B5B2] sm:text-base">
              Hambúrgueres artesanais preparados com carne Angus 150g selecionada, pão de brioche macio e combinações autorais. Personalize seu pedido e envie direto pelo WhatsApp.
            </p>

            {/* Ações principais */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExploreMenu}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#E6C766] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] whitespace-nowrap cursor-pointer"
              >
                <span>Ver cardápio</span>
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onOpenCustomBurger}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#141414] px-5 py-3 text-sm font-medium text-[#F5F5F4] transition-colors hover:border-[#D4AF37]/60 hover:text-[#D4AF37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] whitespace-nowrap cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
                <span>Monte do seu jeito</span>
              </button>
            </div>
          </div>

          {/* Painel de Informações de Atendimento */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#131313] p-5 sm:p-6 lg:col-span-5">
            <div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.08] pb-3.5">
                <div>
                  <p className="text-xs text-[#8E8E8A]">Atendimento</p>
                  <p
                    className={`mt-0.5 text-base font-semibold ${
                      storeStatus.isOpen ? 'text-[#D4AF37]' : 'text-[#F5F5F4]'
                    }`}
                  >
                    {storeStatus.statusHeadline}
                  </p>
                </div>
                <span className="price-num text-xs text-[#8E8E8A]">
                  Horário local · {storeStatus.currentTimeFormatted}
                </span>
              </div>

              {storeStatus.isOpen ? (
                <p className="mt-3.5 text-sm leading-relaxed text-[#D1D1CE]">
                  {storeStatus.statusDetail}. Pedidos liberados para envio pelo WhatsApp.
                </p>
              ) : (
                <div
                  role="status"
                  className="mt-3.5 rounded-xl border border-[#D4AF37]/25 bg-[#1B1810] p-3.5 text-xs leading-relaxed text-[#DED5B8]"
                >
                  <p className="font-medium text-[#E7D394]">
                    {storeStatus.statusDetail}
                  </p>
                  <p className="mt-1">
                    O cardápio segue visível para consulta e montagem, mas a finalização pelo WhatsApp é liberada somente no expediente. Próximo horário: {storeStatus.nextOpeningText}.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-white/[0.08] pt-4 text-sm text-[#B5B5B2]">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden="true" />
                <div>
                  <p className="font-medium text-[#F5F5F4]">Quinta a Domingo · 19h às 22h30</p>
                  <p className="text-xs text-[#8E8E8A]">Segunda, terça e quarta: fechado</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden="true" />
                <div>
                  <p className="font-medium text-[#F5F5F4]">{STORE_CONFIG.address}</p>
                  <p className="text-xs text-[#8E8E8A]">Delivery · Retirada · Consumo no local</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden="true" />
                <div>
                  <a
                    href={STORE_CONFIG.whatsappBaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#F5F5F4] transition-colors hover:text-[#D4AF37]"
                  >
                    WhatsApp {STORE_CONFIG.whatsappDisplay}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
