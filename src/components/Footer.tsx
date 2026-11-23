import { STORE_CONFIG } from '../data/menu';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onOpenInfo: () => void;
}

export function Footer({ onOpenInfo }: FooterProps) {
  return (
    <footer className="border-t border-[#262626] bg-[#101010] pb-24 pt-6 md:pb-8">
      <div className="mx-auto flex max-w-[1040px] flex-col items-start justify-between gap-3 px-4 text-[12.5px] text-[#B3B3B3] sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-10 w-10" alt="Logo Uai Burguer" />
          <div>
            <p className="font-bold text-[#FFFFFF]">
              {STORE_CONFIG.displayName} ·{' '}
              <span className="font-normal text-[#B3B3B3]">
                {STORE_CONFIG.sloganCompact}
              </span>
            </p>
            <p className="mt-0.5 text-[#8A8A8A]">
              {STORE_CONFIG.address} · Qui a Dom · 19h–22h30
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenInfo}
            className="min-h-[44px] text-[12.5px] font-medium text-[#E5E5E5] transition-colors duration-150 hover:text-[#F5B700] cursor-pointer"
          >
            Informações e taxas
          </button>
          <a
            href={STORE_CONFIG.whatsappBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center font-semibold text-[#F5B700] transition-colors duration-150 hover:text-[#FFCA28]"
          >
            {STORE_CONFIG.whatsappDisplay}
          </a>
        </div>
      </div>
    </footer>
  );
}
