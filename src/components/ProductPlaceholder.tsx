import { useState } from 'react';
import { CategoryId } from '../types/menu';

interface ProductPlaceholderProps {
  name: string;
  category: CategoryId;
  imageUrl?: string;
  aspectClass?: string;
  compact?: boolean;
}

function CategoryEmblem({ category }: { category: CategoryId }) {
  switch (category) {
    case 'hamburgueres':
    case 'combos':
    case 'monte-do-seu-jeito':
      return (
        <svg
          width="44"
          height="44"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          className="text-[#D4AF37]/75"
        >
          {/* Top brioche dome */}
          <path
            d="M10 21C10 13.5 16.2 9 24 9C31.8 9 38 13.5 38 21H10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Angus patty wave */}
          <path
            d="M8 26.5H40"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Cheese melt accent */}
          <path
            d="M12 21L16 24.5L21 21L26 24.5L31 21L36 24"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          {/* Bottom bun */}
          <path
            d="M11 31.5H37C37 35 34.2 37.5 30.8 37.5H17.2C13.8 37.5 11 35 11 31.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'molhos':
      return (
        <svg
          width="40"
          height="40"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          className="text-[#D4AF37]/75"
        >
          <path
            d="M11 22H37L33.5 36H14.5L11 22Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M15 22C16.5 17.5 20 16 24 16C28 16 31.5 17.5 33 22"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M21 12.5C22.5 11 25.5 11 27 12.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      );
    case 'acompanhamentos':
      return (
        <svg
          width="40"
          height="40"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          className="text-[#D4AF37]/75"
        >
          <path
            d="M14 21H34L31.5 38H16.5L14 21Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M17 21L15 11M21.5 21L20.5 9M26.5 21L27.5 9.5M31 21L33 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'refrigerantes':
      return (
        <svg
          width="40"
          height="40"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          className="text-[#D4AF37]/75"
        >
          <rect
            x="16"
            y="12"
            width="16"
            height="26"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M18 9H30M16 19H32M16 31H32"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
      );
  }
}

/**
 * Componente de imagem padronizado para todos os produtos.
 * Quando `imageUrl` for preenchido em src/data/menu.ts, exibe a fotografia oficial
 * com carregamento otimizado. Enquanto vazio (ou caso falhe), apresenta placeholder
 * editorial em preto, cinza grafite e detalhes dourados.
 */
export function ProductPlaceholder({
  name,
  category,
  imageUrl,
  aspectClass = 'aspect-[4/3]',
  compact = false,
}: ProductPlaceholderProps) {
  const [imgError, setImgError] = useState(false);
  const hasValidImage = Boolean(imageUrl && imageUrl.trim().length > 0 && !imgError);

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden bg-[#111111] select-none`}
    >
      {hasValidImage ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div
          className="relative flex h-full w-full flex-col items-center justify-center bg-[#121212] p-4 text-center"
          role="img"
          aria-label={`Espaço reservado para fotografia de ${name}`}
        >
          {/* Subtle charcoal tonal radial sheen (restrained, non-glossy) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(212,175,55,0.07),transparent_68%)]"
          />

          {/* Fine inner hairline border frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 rounded-lg border border-[#D4AF37]/15"
          />

          {/* Refined gold corner marks */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3 h-2.5 w-2.5 border-l border-t border-[#D4AF37]/50"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 h-2.5 w-2.5 border-r border-t border-[#D4AF37]/50"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 left-3 h-2.5 w-2.5 border-b border-l border-[#D4AF37]/50"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 right-3 h-2.5 w-2.5 border-b border-r border-[#D4AF37]/50"
          />

          <div className="relative z-10 flex flex-col items-center gap-2">
            <CategoryEmblem category={category} />
            {!compact && (
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-display text-xs tracking-[0.14em] text-[#D4AF37]/80">
                  UAI BURGUER
                </span>
                <span className="text-[11px] text-[#787878]">
                  Fotografia oficial em breve
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
