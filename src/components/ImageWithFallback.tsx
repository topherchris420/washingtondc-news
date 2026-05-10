import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ImageFallbackVariant = 'icon' | 'text' | 'gradient';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fallbackClassName?: string;
  /**
   * Visual style for the fallback when the image fails to load or is missing.
   * - 'icon'    (default): icon + label on a soft gray background.
   * - 'text'    : label only, no icon — for tight or stylized cards.
   * - 'gradient': rich brand gradient with the label as an overlay tag.
   */
  fallbackVariant?: ImageFallbackVariant;
}

export const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackText = 'No image',
  fallbackClassName,
  fallbackVariant = 'icon',
  ...props
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    if (fallbackVariant === 'text') {
      return (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center text-xs font-medium uppercase tracking-wider text-gray-400 bg-gray-50',
            fallbackClassName,
          )}
        >
          {fallbackText}
        </div>
      );
    }

    if (fallbackVariant === 'gradient') {
      return (
        <div
          className={cn(
            'flex h-full w-full items-end p-5 text-white/85 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-700',
            fallbackClassName,
          )}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            {fallbackText}
          </span>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center gap-2 text-xs text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100',
          fallbackClassName,
        )}
      >
        <ImageOff className="h-4 w-4 opacity-50" />
        <span>{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
};
