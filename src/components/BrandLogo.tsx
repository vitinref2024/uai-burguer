import { useState } from 'react';
import { STORE_CONFIG } from '../data/menu';

interface BrandLogoProps {
  /** Classes de dimensão do container circular (ex: 'h-11 w-11') */
  className?: string;
  /** Variantes visuais para cabeçalhos ou marca d'água sutil nos placeholders */
  variant?: 'default' | 'watermark';
  /** Texto alternativo acessível (use '' quando decorativo junto ao nome) */
  alt?: string;
}

/**
 * Logo oficial circular da UAI BURGUER.
 * Enquadra o anel dourado da marca em formato 1:1 com fundo preto fiel à arte original
 * e fallback tipográfico caso a imagem não esteja disponível.
 */
export function BrandLogo({
  className = 'h-10 w-10',
  variant = 'default',
  alt = 'Logo Uai Burguer',
}: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);
  const src = STORE_CONFIG.logoUrl.trim();
  const hasImage = Boolean(src.length > 0 && !hasError);

  if (variant === 'watermark') {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#000000] ring-1 ring-[#F5B700]/25 select-none ${className}`}
      >
        {hasImage ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover object-center scale-[1.06]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="text-[11px] font-bold tracking-[0.12em] text-[#F5B700]"
          >
            UAI
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#F5B700]/80 bg-[#000000] select-none ${className}`}
    >
      {hasImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover object-center scale-[1.06]"
        />
      ) : (
        <span
          aria-hidden="true"
          className="text-[11px] font-bold tracking-[0.12em] text-[#F5B700]"
        >
          UAI
        </span>
      )}
    </div>
  );
}
