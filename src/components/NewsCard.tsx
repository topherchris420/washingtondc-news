import { Clock, ExternalLink, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type NewsCardVariant = 'featured' | 'standard' | 'compact';

interface NewsCardProps {
  title: string;
  description?: string;
  url: string;
  category: string;
  readTime: string;
  recency: string;
  thumbnail?: string | null;
  variant?: NewsCardVariant;
  className?: string;
}

const typographyByVariant: Record<NewsCardVariant, { title: string; description: string; metadata: string }> = {
  featured: {
    title: 'text-2xl md:text-3xl font-black leading-tight',
    description: 'text-base leading-relaxed line-clamp-4',
    metadata: 'text-xs',
  },
  standard: {
    title: 'text-base font-bold leading-snug line-clamp-3',
    description: 'text-sm leading-relaxed line-clamp-3',
    metadata: 'text-xs',
  },
  compact: {
    title: 'text-sm font-bold leading-snug line-clamp-2',
    description: 'text-xs leading-relaxed line-clamp-2',
    metadata: 'text-[10px]',
  },
};

export const NewsCard = ({
  title,
  description,
  url,
  category,
  readTime,
  recency,
  thumbnail,
  variant = 'standard',
  className,
}: NewsCardProps) => {
  const typeStyles = typographyByVariant[variant];
  const isFeatured = variant === 'featured';
  const showThumbnail = !isFeatured;
  const [imageError, setImageError] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block h-full border border-gray-200 bg-white transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2',
        isFeatured ? 'p-6' : variant === 'standard' ? 'p-5' : 'p-4',
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-2.5 text-gray-500">
        <span
          className={cn(
            'font-bold uppercase tracking-wider',
            variant === 'featured'
              ? 'text-[11px] text-red-600'
              : 'text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5',
          )}
        >
          {category}
        </span>
      </div>

      {showThumbnail && (
        <div className="mb-3 overflow-hidden border border-gray-100 bg-gray-50">
          {thumbnail && !imageError ? (
            <img
              src={thumbnail}
              alt=""
              className="h-28 w-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="h-28 w-full flex items-center justify-center gap-2 text-xs text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
              <ImageOff className="h-3.5 w-3.5" />
              No image available
            </div>
          )}
        </div>
      )}

      <h3
        className={cn(
          'text-gray-900 transition-colors group-hover:text-blue-900',
          typeStyles.title,
          isFeatured && "font-['Georgia',_serif]",
        )}
      >
        {title}
      </h3>

      {description && (
        <p className={cn('mt-2 text-gray-600', typeStyles.description)}>
          {description}
        </p>
      )}

      <div className={cn('mt-3 flex items-center gap-2 text-gray-500', typeStyles.metadata)}>
        <span>{category}</span>
        <span aria-hidden="true">•</span>
        <span>{readTime}</span>
        <span aria-hidden="true">•</span>
        <span className="inline-flex items-center gap-1">
          <Clock className={cn(variant === 'compact' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
          {recency}
        </span>
        <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </a>
  );
};
