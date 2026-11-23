import { useEffect } from 'react';
import { Clock, CreditCard, MapPin, MessageCircle, Truck, X } from 'lucide-react';
import { STORE_CONFIG, STORE_SCHEDULE } from '../data/menu';
import { StoreStatus } from '../types/menu';
import { BrandLogo } from './BrandLogo';

interface StoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeStatus: StoreStatus;
}

export function StoreInfoModal({
  isOpen,
  onClose,
  storeStatus,
}: StoreInfoModalProps) {
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-info-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-[#262626] bg-[#141414] sm:rounded-2xl">
        {/* Topo */}
        <div className="flex items-center justify-between gap-3 border-b border-[#262626] px-5 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo className="h-11 w-11" alt="" />
            <div className="min-w-0">
              <h2
                id="store-info-title"
                className="text-[18px] font-bold text-[#FFFFFF]"
              >
                Informações
              </h2>
              <p className="truncate text-[12.5px] text-[#B3B3B3]">
                {STORE_CONFIG.displayName} · {STORE_CONFIG.sloganCompact}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar informações"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#262626] bg-[#1B1B1B] text-[#FFFFFF] transition-colors duration-150 hover:border-[#F5B700]/60 cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4 text-[13.5px] text-[#E5E5E5]">
          {/* Status atual */}
          <div className="rounded-xl border border-[#262626] bg-[#1B1B1B] px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 font-semibold text-[#FFFFFF]">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${
                    storeStatus.isOpen ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                {storeStatus.isOpen ? 'Aberto agora' : 'Fechado no momento'}
              </span>
              <span className="price-num text-[12px] text-[#B3B3B3]">
                {storeStatus.currentTimeFormatted}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] text-[#B3B3B3]">
              {storeStatus.isOpen
                ? storeStatus.statusDetail
                : `${storeStatus.statusDetail} Finalização liberada somente no horário de atendimento.`}
            </p>
          </div>

          {/* Endereço e formas de receber */}
          <div className="flex items-start gap-3">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B700]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <div>
              <h3 className="text-[13px] font-semibold text-[#FFFFFF]">
                Endereço e atendimento
              </h3>
              <p className="mt-0.5 text-[13.5px] text-[#E5E5E5]">
                {STORE_CONFIG.address}
              </p>
              <p className="mt-0.5 text-[12.5px] text-[#B3B3B3]">
                Formas de receber: Delivery, Retirada e Consumo no local.
              </p>
            </div>
          </div>

          {/* Horários */}
          <div className="flex items-start gap-3 border-t border-[#262626] pt-4">
            <Clock
              className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B700]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <div className="flex-1">
              <h3 className="text-[13px] font-semibold text-[#FFFFFF]">
                Horário de funcionamento
              </h3>
              <dl className="mt-2 space-y-1 text-[12.5px]">
                {STORE_SCHEDULE.map((day) => (
                  <div
                    key={day.dayIndex}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <dt className="text-[#B3B3B3]">{day.label}</dt>
                    <dd
                      className={`price-num font-medium ${
                        day.isOpenDay ? 'text-[#FFFFFF]' : 'text-[#737373]'
                      }`}
                    >
                      {day.displayHours}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Taxas de entrega */}
          <div className="flex items-start gap-3 border-t border-[#262626] pt-4">
            <Truck
              className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B700]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <div className="flex-1">
              <h3 className="text-[13px] font-semibold text-[#FFFFFF]">
                Entrega e taxas
              </h3>
              <dl className="mt-2 space-y-1 text-[12.5px]">
                {STORE_CONFIG.deliveryReferenceRates.map((rate) => (
                  <div
                    key={rate.area}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <dt className="text-[#B3B3B3]">{rate.area}</dt>
                    <dd className="price-num font-bold text-[#F5B700]">
                      {rate.feeLabel}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-[12px] leading-relaxed text-[#8A8A8A]">
                A taxa de entrega não é somada automaticamente ao subtotal e é confirmada diretamente pelo WhatsApp após o envio da comanda.
              </p>
            </div>
          </div>

          {/* Formas de pagamento */}
          <div className="flex items-start gap-3 border-t border-[#262626] pt-4">
            <CreditCard
              className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B700]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <div>
              <h3 className="text-[13px] font-semibold text-[#FFFFFF]">
                Formas de pagamento
              </h3>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#B3B3B3]">
                Pix (chave enviada pelo WhatsApp), Dinheiro (com opção de troco) e Cartão na entrega ou presencialmente no estabelecimento.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé com WhatsApp */}
        <div className="border-t border-[#262626] bg-[#101010] px-5 py-3.5">
          <a
            href={STORE_CONFIG.whatsappBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#F5B700] px-4 py-2.5 text-[13.5px] font-bold text-[#0B0B0B] transition-colors duration-150 hover:bg-[#FFCA28]"
          >
            <MessageCircle
              className="h-4 w-4 text-[#0B0B0B]"
              strokeWidth={2.25}
              aria-hidden="true"
            />
            <span>WhatsApp {STORE_CONFIG.whatsappDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
