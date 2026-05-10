import { Clock, Bookmark, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import type { NewsArticle } from '@/hooks/useDCNews';

interface FeaturedStoryCardProps {
  article: NewsArticle;
  formatTime: (dateString: string) => string;
}

export const FeaturedStoryCard = ({ article, formatTime }: FeaturedStoryCardProps) => {
  return (
    <article className="group bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-xl motion-safe:focus-within:-translate-y-0.5 motion-safe:focus-within:shadow-xl motion-reduce:transition-none">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block h-64 md:h-80 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <ImageWithFallback
          src={article.image}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          fallbackText="District Briefing"
          fallbackVariant="gradient"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute left-5 top-5 rounded-md bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-900 shadow-sm backdrop-blur-sm">
          {article.source.name}
        </div>
      </a>

      <div className="p-6 md:p-8">
        <h1 className="max-w-2xl text-3xl md:text-4xl font-black text-gray-900 leading-[1.1] font-headline">
          {article.title}
        </h1>

        <p className="mt-4 max-w-2xl text-base text-gray-600 leading-relaxed line-clamp-3">
          {article.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 opacity-60" />
            {formatTime(article.publishedAt)}
          </span>
          <span aria-hidden="true" className="text-gray-300">•</span>
          <span className="text-red-600 font-semibold">Top Story</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-blue-900 hover:bg-blue-800 text-white rounded-md shadow-sm hover:shadow transition-all duration-200">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
              Read Story
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>

          <Button type="button" variant="outline" className="inline-flex items-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-md transition-all duration-200">
            <Bookmark className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </article>
  );
};
