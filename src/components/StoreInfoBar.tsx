import { Info, MapPin, MessageCircle } from 'lucide-react';
import { STORE_CONFIG } from '../data/menu';
import { StoreStatus } from '../types/menu';

interface StoreInfoBarProps {
  storeStatus: StoreStatus;
  onOpenInfo: () => void;
}

/**
 * Faixa de informações compacta em superfície escura:
 * - Status em linha compacta: bolinha + Aberto/Fechado + horário
 * - Ações com ícones amarelos e rótulos brancos visíveis (12px): WhatsApp, Endereço e Informações
 */
export function StoreInfoBar({ storeStatus, onOpenInfo }: StoreInfoBarProps) {
  return (
    <div className="bg-[#0B0B0B]">
      <div className="mx-auto max-w-[1040px] px-4 py-1.5">
        <div className="flex flex-col rounded-xl border border-[#262626] bg-[#141414] px-3 py-1 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0.5">
          {/* Status + Horário em linha compacta */}
          <div className="flex min-h-[34px] items-center gap-2 text-[12.5px]">
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${
                storeStatus.isOpen ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            {storeStatus.isOpen ? (
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-[#FFFFFF]">Aberto</span>
                <span aria-hidden="true" className="text-[#525252]">
                  ·
                </span>
                <span className="truncate text-[#B3B3B3]">
                  Todos os dias · 17h30–00h
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-red-400">Fechado</span>
                <span aria-hidden="true" className="text-[#525252]">
                  ·
                </span>
                <span className="truncate text-[#B3B3B3]">
                  {storeStatus.compactClosedLabel || 'Abrimos hoje às 17h30'}
                </span>
              </div>
            )}
          </div>

          {/* Ações com ícones amarelos e rótulos visíveis (12px) */}
          <div className="flex items-center justify-between gap-1 border-t border-[#262626] md:justify-end md:gap-2 md:border-t-0">
            <a
              href={STORE_CONFIG.whatsappBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-1 text-[12px] font-medium text-[#E5E5E5] transition-colors duration-150 hover:bg-[#1E1E1E] hover:text-[#FFFFFF] whitespace-nowrap sm:px-2"
            >
              <MessageCircle
                className="h-3.5 w-3.5 shrink-0 text-[#F5B700]"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onOpenInfo}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-1 text-[12px] font-medium text-[#E5E5E5] transition-colors duration-150 hover:bg-[#1E1E1E] hover:text-[#FFFFFF] whitespace-nowrap sm:px-2 cursor-pointer"
            >
              <MapPin
                className="h-3.5 w-3.5 shrink-0 text-[#F5B700]"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span>Endereço</span>
            </button>

            <button
              type="button"
              onClick={onOpenInfo}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-1 text-[12px] font-medium text-[#E5E5E5] transition-colors duration-150 hover:bg-[#1E1E1E] hover:text-[#FFFFFF] whitespace-nowrap sm:px-2 cursor-pointer"
            >
              <Info
                className="h-3.5 w-3.5 shrink-0 text-[#F5B700]"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span>Informações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
