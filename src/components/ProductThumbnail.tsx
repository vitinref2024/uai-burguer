import { useState } from 'react';
import { CategoryId } from '../types/menu';
import { BrandLogo } from './BrandLogo';

interface ProductThumbnailProps {
  name: string;
  category: CategoryId;
  imagem?: string;
  imageUrl?: string;
  /** Tamanho visual do placeholder ('card' | 'modal') */
  size?: 'card' | 'modal';
  className?: string;
}

/**
 * Área de imagem 1:1 fixa com carregamento lazy e object-fit: cover.
 * Quando o produto não possui foto cadastrada, exibe placeholder elegante
 * em preto fosco (#0E0E0E) com a logo oficial da Uai Burguer centralizada.
 */
export function ProductThumbnail({
  name,
  imagem,
  imageUrl,
  size = 'card',
  className = '',
}: ProductThumbnailProps) {
  const resolvedSrc = (imagem || imageUrl || '').trim();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(resolvedSrc.length > 0 && failedSrc !== resolvedSrc);

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-xl border border-[#262626] bg-[#0E0E0E] select-none ${className}`}
    >
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(resolvedSrc)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`Espaço de imagem de ${name}`}
          className="flex h-full w-full flex-col items-center justify-center p-2"
        >
          <BrandLogo
            variant="watermark"
            alt=""
            className={
              size === 'modal'
                ? 'h-28 w-28 opacity-75'
                : 'h-14 w-14 md:h-16 md:w-16 opacity-45'
            }
          />
          {size === 'modal' && (
            <span className="mt-3 text-[12px] font-medium text-[#8A8A8A]">
              Uai Burguer · Aqui o Burguer é Angus
            </span>
          )}
        </div>
      )}
    </div>
  );
}
