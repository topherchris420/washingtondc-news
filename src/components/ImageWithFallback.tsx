import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fallbackClassName?: string;
}

export const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackText = 'No image',
  fallbackClassName,
  ...props
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);

  if (error || !src) {
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
