import { ArrowRight, Clock3, MapPin } from 'lucide-react';
import { STORE_CONFIG } from '../data/menu';
import { StoreStatus } from '../types/menu';

interface HeroProps {
  storeStatus: StoreStatus;
  onExploreMenu: () => void;
}

export function Hero({ storeStatus, onExploreMenu }: HeroProps) {
  return (
    <section
      id="topo"
      aria-labelledby="hero-heading"
      className="hero-shell relative overflow-hidden border-y border-white/[0.08] bg-[#111111]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-[#F5B700]/[0.08] blur-3xl"
      />
      <div className="relative mx-auto grid max-w-[1040px] items-center gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-8 lg:py-14">
        <div className="hero-copy relative z-10 max-w-xl">
          <div className="mb-5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#F5B700]">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${
                storeStatus.isOpen ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />
            <span>{storeStatus.isOpen ? 'Aberto agora' : 'Fechado agora'}</span>
          </div>

          <h1
            id="hero-heading"
            className="max-w-[600px] text-[clamp(2.7rem,7vw,5.25rem)] font-black leading-[0.94] tracking-[-0.065em] text-white"
          >
            Seu próximo pedido está aqui
          </h1>

          <p className="mt-5 max-w-[480px] text-[15px] leading-7 text-[#C7C7C7] sm:text-base">
            Hambúrgueres artesanais com carne Angus 150g, pão macio e combinações que chegam quentes, caprichadas e prontas para matar a fome.
          </p>

          <button
            type="button"
            onClick={onExploreMenu}
            className="group mt-7 inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-[#F5B700] px-6 py-3.5 text-[13px] font-extrabold tracking-[0.08em] text-[#0B0B0B] shadow-[0_12px_35px_rgba(245,183,0,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFCA28] hover:shadow-[0_16px_38px_rgba(245,183,0,0.28)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5B700] active:translate-y-0"
          >
            <span>FAZER MEU PEDIDO</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/[0.1] pt-5 text-[12px] text-[#A9A9A9] sm:text-[13px]">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#F5B700]" aria-hidden="true" />
              <span>{STORE_CONFIG.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[#F5B700]" aria-hidden="true" />
              <span>Qui a Dom · 19h às 22h30</span>
            </div>
          </div>
        </div>

        <div className="hero-photo relative min-h-[300px] overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-[#080808] shadow-2xl sm:min-h-[420px] lg:min-h-[520px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-gradient-to-r from-[#111111]/35 via-transparent to-transparent lg:from-[#111111]/55"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-t from-[#080808]/75 to-transparent"
          />
          <img
            src="/assets/aistudio/classico.jpeg.jpeg"
            alt="Hambúrguer artesanal com queijo e bacon"
            className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.035]"
            loading="eager"
            decoding="async"
          />
          <div className="absolute bottom-5 left-5 z-20 rounded-full border border-white/15 bg-[#0B0B0B]/75 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
            Feito na hora
          </div>
        </div>
      </div>
    </section>
  );
}
