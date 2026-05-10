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
   *
   * The fallback always inherits the same `className`, `width`, `height`, and
   * inline `style` as the underlying <img>, so its box (and therefore aspect
   * ratio) matches the loaded image exactly.
   */
  fallbackVariant?: ImageFallbackVariant;
}

// Variant-specific presentation classes. Sizing classes are intentionally
// omitted — sizing comes from the caller's `className` so the fallback
// occupies the exact same box as the <img> would.
const variantStyles: Record<ImageFallbackVariant, string> = {
  icon: 'flex items-center justify-center gap-2 text-xs text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100',
  text: 'flex items-center justify-center text-xs font-medium uppercase tracking-wider text-gray-400 bg-gray-50',
  gradient:
    'flex items-end p-5 text-white/85 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-700',
};

export const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackText = 'No image',
  fallbackClassName,
  fallbackVariant = 'icon',
  width,
  height,
  style,
  ...props
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        // Mirror the <img>'s sizing so the fallback preserves aspect ratio
        // whether the caller controls size via classes, attributes, or style.
        className={cn(className, variantStyles[fallbackVariant], fallbackClassName)}
        style={{
          width: width as number | string | undefined,
          height: height as number | string | undefined,
          ...style,
        }}
        role="img"
        aria-label={typeof alt === 'string' && alt.length > 0 ? alt : fallbackText}
      >
        {fallbackVariant === 'icon' && (
          <>
            <ImageOff className="h-4 w-4 opacity-50" />
            <span>{fallbackText}</span>
          </>
        )}
        {fallbackVariant === 'text' && <span>{fallbackText}</span>}
        {fallbackVariant === 'gradient' && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            {fallbackText}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onError={() => setError(true)}
      {...props}
    />
  );
};
