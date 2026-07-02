import { useMemo, useState } from 'react';
import {
  ChevronRight,
  Clock,
  Cloud,
  Droplets,
  ExternalLink,
  Gauge,
  Landmark,
  Mail,
  MapPin,
  Radio,
  Search,
  ShieldCheck,
  Sunrise,
  Sunset,
  Thermometer,
  TrainFront,
  Wind,
  X,
} from 'lucide-react';

import dc4Logo from '@/assets/dc4-news-logo.png';
import { GlitchOverlay } from '@/components/GlitchOverlay';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDCNews, type NewsArticle } from '@/hooks/useDCNews';
import { useDCWeather } from '@/hooks/useDCWeather';
import { useNewsPreferences } from '@/hooks/useNewsPreferences';
import { cn } from '@/lib/utils';
import { resolveCovcomSignal } from '@/lib/covcom';

type SectionName =
  | 'Local'
  | 'Politics'
  | 'Crime & Safety'
  | 'Weather'
  | 'Traffic'
  | 'Sports'
  | 'Entertainment';

const navLinks: SectionName[] = [
  'Local',
  'Politics',
  'Crime & Safety',
  'Weather',
  'Traffic',
  'Sports',
  'Entertainment',
];

const neighborhoodLinks = ['Capitol Hill', 'Georgetown', 'Anacostia', 'Shaw', 'Dupont Circle', 'Petworth'];

const civicBriefs = [
  'DC Council committee hearings resume at 10:00 AM.',
  'Metro advisories remain active on select evening trips.',
  'DDOT is collecting comments on curb access and bus priority corridors.',
  'Ward public safety listening sessions continue this week.',
];

const mostReadStories = [
  'Council advances housing measure after late-night markup',
  'Metro reports Green Line delays after signal inspection',
  'Where street closures will affect the weekend race route',
  'New restaurant openings around Union Market and H Street',
  'How property tax appeals are moving through the city this month',
];

const sectionKicker: Record<SectionName, string> = {
  Local: 'District Desk',
  Politics: 'Council Watch',
  'Crime & Safety': 'Public Safety',
  Weather: 'Weather Desk',
  Traffic: 'Metro & Roads',
  Sports: 'DC Sports',
  Entertainment: 'Arts & Life',
};

const getArticleCategory = (title: string, sourceName: string): SectionName => {
  const content = (title + ' ' + sourceName).toLowerCase();

  if (content.includes('police') || content.includes('security') || content.includes('crime')) {
    return 'Crime & Safety';
  }
  if (content.includes('weather') || content.includes('bloom')) return 'Weather';
  if (
    content.includes('metro') ||
    content.includes('airport') ||
    content.includes('traffic') ||
    content.includes('ddot') ||
    content.includes('wmata')
  ) {
    return 'Traffic';
  }
  if (
    content.includes('council') ||
    content.includes('capitol') ||
    content.includes('budget') ||
    content.includes('congress')
  ) {
    return 'Politics';
  }
  if (content.includes('nationals') || content.includes('commanders') || content.includes('sports')) {
    return 'Sports';
  }
  if (
    content.includes('museum') ||
    content.includes('zoo') ||
    content.includes('festival') ||
    content.includes('kennedy')
  ) {
    return 'Entertainment';
  }

  return 'Local';
};

const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return diffHours + ' hours ago';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + ' days ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

const getReadTime = (article: NewsArticle) => {
  const words = (article.title + ' ' + article.description + ' ' + article.content).split(/\s+/).length;
  return Math.max(2, Math.ceil(words / 180)) + ' min read';
};

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const SectionTitle = ({ label, title }: { label: string; title: string }) => (
  <div className="mb-4 border-b-2 border-neutral-950 pb-2">
    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-800">{label}</p>
    <h2 className="font-headline text-2xl font-bold leading-none text-neutral-950">{title}</h2>
  </div>
);

const StoryCard = ({
  article,
  onOpen,
  onDismiss,
}: {
  article: NewsArticle;
  onOpen: (article: NewsArticle) => void;
  onDismiss?: (storyId: string) => void;
}) => {
  const category = getArticleCategory(article.title, article.source.name);

  return (
    <article className="group relative h-full border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => onOpen(article)}
        className="flex h-full w-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4"
      >
        <ImageWithFallback
          src={article.image}
          alt=""
          className="aspect-[16/10] w-full border-b border-neutral-200 object-cover grayscale-[12%] transition duration-500 group-hover:grayscale-0"
          loading="lazy"
          fallbackText="District Briefing"
          fallbackVariant="gradient"
        />
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-red-800">
              {category}
            </span>
            <span className="text-[11px] font-semibold text-neutral-500">{getReadTime(article)}</span>
          </div>
          <h3 className="mt-2 font-headline text-xl font-bold leading-tight text-neutral-950 group-hover:text-red-800">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">{article.description}</p>
          <div className="mt-auto flex items-center gap-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            <Clock className="h-3 w-3" />
            <span>{formatTime(article.publishedAt)}</span>
            <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-70" />
          </div>
        </div>
      </button>
      {onDismiss && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDismiss(article.id);
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border border-white/70 bg-white/90 text-neutral-500 shadow-sm transition hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
          aria-label="Dismiss story"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </article>
  );
};

const BriefStory = ({ article, onOpen }: { article: NewsArticle; onOpen: (article: NewsArticle) => void }) => {
  const category = getArticleCategory(article.title, article.source.name);

  return (
    <article className="group border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => onOpen(article)}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4"
      >
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-800">{category}</p>
        <h3 className="mt-1 font-headline text-lg font-bold leading-tight text-neutral-950 group-hover:text-red-800">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{article.description}</p>
        <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
          <span>{article.source.name}</span>
          <span aria-hidden="true">/</span>
          <span>{formatTime(article.publishedAt)}</span>
        </div>
      </button>
    </article>
  );
};

const RailStory = ({ article, onOpen }: { article: NewsArticle; onOpen: (article: NewsArticle) => void }) => {
  const category = getArticleCategory(article.title, article.source.name);

  return (
    <button
      type="button"
      onClick={() => onOpen(article)}
      className="group grid w-full grid-cols-[72px_1fr] gap-3 border-b border-neutral-200 py-3 text-left last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4"
    >
      <ImageWithFallback
        src={article.image}
        alt=""
        className="h-[72px] w-[72px] border border-neutral-200 object-cover grayscale-[15%]"
        loading="lazy"
        fallbackText="DC4"
        fallbackVariant="text"
      />
      <span>
        <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
          {category}
        </span>
        <span className="mt-1 block text-sm font-bold leading-snug text-neutral-950 group-hover:text-red-800">
          {article.title}
        </span>
        <span className="mt-1 block text-[11px] text-neutral-500">{formatTime(article.publishedAt)}</span>
      </span>
    </button>
  );
};

const WeatherMetric = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wind;
  label: string;
  value: string;
}) => (
  <div className="bg-white p-3">
    <div className="flex items-center gap-2 text-neutral-500">
      <Icon className="h-4 w-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.16em]">{label}</span>
    </div>
    <p className="mt-1 text-sm font-bold text-neutral-950">{value}</p>
  </div>
);

const StatusRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrainFront;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 border-b border-neutral-200 pb-3 last:border-b-0 last:pb-0">
    <Icon className="mt-0.5 h-4 w-4 text-red-800" />
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-neutral-900">{value}</p>
    </div>
  </div>
);

const FooterList = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-white">{title}</h3>
    <ul className="mt-4 space-y-2 text-sm text-neutral-400">
      {items.map((item) => (
        <li key={item}>
          <a href="#" className="hover:text-white hover:underline">
            {item}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const DCNewsLanding = () => {
  const [searchValue, setSearchValue] = useState('');
  const [glitchTarget, setGlitchTarget] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<SectionName>('Local');

  const { articles, loading, error } = useDCNews();
  const { weather } = useDCWeather();
  const {
    selectedCategory,
    setSelectedCategory,
    dismissedStories,
    dismissStory,
    restoreDismissedStories,
    readingDensity,
    setReadingDensity,
    viewedCategories,
    continueReading,
    trackArticleView,
    clearContinueReading,
  } = useNewsPreferences();

  const visibleArticles = useMemo(
    () => articles.filter((article) => !dismissedStories.includes(article.id)),
    [articles, dismissedStories],
  );

  const sectionArticles = useMemo(
    () => visibleArticles.filter((article) => getArticleCategory(article.title, article.source.name) === activeCategory),
    [activeCategory, visibleArticles],
  );
  const orderedArticles = useMemo(() => {
    const lead = sectionArticles[0] || visibleArticles[0];
    const rest = visibleArticles.filter((article) => article.id !== lead?.id);
    return lead ? [lead, ...rest] : [];
  }, [sectionArticles, visibleArticles]);

  const leadArticle = orderedArticles[0];
  const secondaryArticles = orderedArticles.slice(1, 5);
  const cardArticles = orderedArticles.slice(5, 11);
  const moreArticles = orderedArticles.slice(11, 17);

  const recommendedArticles = useMemo(() => {
    const personalized = articles
      .filter((article) => !dismissedStories.includes(article.id))
      .filter((article) => viewedCategories.includes(getArticleCategory(article.title, article.source.name)))
      .slice(0, 4);

    return personalized.length > 0 ? personalized : articles.slice(2, 6);
  }, [articles, dismissedStories, viewedCategories]);

  const handleCategoryChange = (category: SectionName) => {
    setActiveCategory(category);
    setSelectedCategory(category);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const action = resolveCovcomSignal(searchValue);

    if (action.type === 'redirect') {
      if (action.glitch) {
        setGlitchTarget(action.destination);
        return;
      }
      window.location.href = action.destination;
      return;
    }

    if (action.type === 'open-contact') {
      window.location.href = 'mailto:ciao_chris@proton.me';
    }
  };

  const handleArticleOpen = (article: NewsArticle) => {
    trackArticleView({
      id: article.id,
      title: article.title,
      url: article.url,
      sourceName: article.source.name,
      category: getArticleCategory(article.title, article.source.name),
    });

    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-neutral-950 antialiased">
      <GlitchOverlay
        active={glitchTarget !== null}
        onComplete={() => {
          if (glitchTarget) window.location.href = glitchTarget;
        }}
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-neutral-950 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
      >
        Skip to main content
      </a>
      <div className="border-b border-neutral-300 bg-neutral-950 text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-red-300">
              <Radio className="h-3.5 w-3.5" /> Live Desk
            </span>
            <span className="hidden text-neutral-400 sm:inline">Washington, District of Columbia</span>
            <span className="hidden truncate text-neutral-300 lg:inline">{today}</span>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap text-neutral-300">
            <span className="inline-flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5" /> {weather.condition}
            </span>
            <span>{weather.temp}&deg;F</span>
            <span className="hidden sm:inline">Wind {weather.wind}</span>
          </div>
        </div>
      </div>

      <header className="bg-[#fbfaf7]">
        <div className="mx-auto max-w-[1440px] px-4 py-5 md:px-6 md:py-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            <div className="hidden text-xs leading-5 text-neutral-600 lg:block">
              <p className="font-black uppercase tracking-[0.18em] text-neutral-950">Morning Edition</p>
              <p>Independent local reporting for residents, commuters, and civic obsessives.</p>
            </div>

            <div className="text-center">
              <h1 className="sr-only">DC4 News - Washington DC Local News</h1>
              <img src={dc4Logo} alt="DC4 News" className="mx-auto h-12 w-auto md:h-16" />
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.32em] text-neutral-600">
                Local News / Politics / Weather / Transit
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2 lg:justify-end">
              <label className="relative block w-full max-w-sm lg:max-w-xs">
                <span className="sr-only">Search DC4 News</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search, tips, signals..."
                  className="h-10 rounded-none border-neutral-400 bg-white pl-9 text-sm focus-visible:ring-neutral-950"
                />
              </label>
              <button
                type="submit"
                className="h-10 border border-neutral-950 bg-neutral-950 px-4 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-40 border-y-2 border-neutral-950 bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto max-w-[1440px] px-4 md:px-6">
          <div className="hidden h-12 items-center justify-between lg:flex">
            <div className="flex h-full items-center">
              {navLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => handleCategoryChange(link)}
                  aria-pressed={activeCategory === link}
                  className={cn(
                    'h-full border-r border-neutral-300 px-4 text-xs font-black uppercase tracking-[0.14em] transition first:border-l hover:bg-neutral-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-950',
                    activeCategory === link ? 'bg-neutral-950 text-white' : 'text-neutral-800',
                  )}
                >
                  {link}
                </button>
              ))}
            </div>
            <a
              href="mailto:ciao_chris@proton.me"
              className="inline-flex h-full items-center gap-2 border-x border-neutral-300 px-4 text-xs font-black uppercase tracking-[0.14em] text-red-800 transition hover:bg-red-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-950"
            >
              <Mail className="h-4 w-4" /> Tip Line
            </a>
          </div>

          <div className="grid gap-2 py-3 lg:hidden">
            <Select value={activeCategory} onValueChange={(value) => handleCategoryChange(value as SectionName)}>
              <SelectTrigger className="h-11 rounded-none border-neutral-400 bg-white font-bold text-neutral-950 focus:ring-neutral-950">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {navLinks.map((link) => (
                  <SelectItem key={link} value={link}>
                    {link}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </nav>

      <div className="border-b border-neutral-300 bg-red-800 text-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2 text-sm md:px-6">
          <span className="bg-white px-2 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-red-800">
            Breaking
          </span>
          <p className="truncate font-semibold">
            {loading ? 'Loading latest district reports...' : leadArticle?.title || 'Latest district updates are being prepared.'}
          </p>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 grid gap-3 border-y border-neutral-300 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-neutral-950">Neighborhoods:</span>
            {neighborhoodLinks.map((link) => (
              <a key={link} href="#" className="hover:text-red-800 hover:underline">
                {link}
              </a>
            ))}
          </div>
          <span className="text-neutral-500">Edition: {sectionKicker[activeCategory]}</span>
        </div>

        {error && (
          <div className="mb-6 border-l-4 border-amber-700 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Live feed unavailable. Showing verified fallback stories while the newsroom reconnects.
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
              <ScrollReveal>
                <article className="border-b-2 border-neutral-950 pb-6 lg:border-b-0 lg:border-r-2 lg:pr-6">
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="aspect-[16/9] bg-neutral-200" />
                      <div className="mt-5 h-4 w-24 bg-neutral-200" />
                      <div className="mt-3 h-10 w-4/5 bg-neutral-200" />
                      <div className="mt-3 h-4 w-full bg-neutral-200" />
                    </div>
                  ) : leadArticle ? (
                    <button
                      type="button"
                      onClick={() => handleArticleOpen(leadArticle)}
                      className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4"
                    >
                      <div className="relative overflow-hidden border border-neutral-300 bg-neutral-200">
                        <ImageWithFallback
                          src={leadArticle.image}
                          alt=""
                          className="aspect-[16/9] w-full object-cover grayscale-[12%] transition duration-700 group-hover:scale-[1.02] group-hover:grayscale-0"
                          fallbackText="District Lead"
                          fallbackVariant="gradient"
                        />
                        <span className="absolute left-4 top-4 bg-red-800 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white">
                          Lead Story
                        </span>
                      </div>
                      <p className="mt-5 text-[12px] font-black uppercase tracking-[0.2em] text-red-800">
                        {sectionKicker[getArticleCategory(leadArticle.title, leadArticle.source.name)]}
                      </p>
                      <h2 className="mt-2 max-w-4xl font-headline text-4xl font-bold leading-[1.02] text-neutral-950 md:text-5xl lg:text-6xl">
                        {leadArticle.title}
                      </h2>
                      <p className="mt-4 max-w-3xl text-lg leading-8 text-neutral-700">
                        {leadArticle.description}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-neutral-300 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-neutral-600">
                        <span>{leadArticle.source.name}</span>
                        <span aria-hidden="true">/</span>
                        <span>{formatTime(leadArticle.publishedAt)}</span>
                        <span aria-hidden="true">/</span>
                        <span>{getReadTime(leadArticle)}</span>
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </button>
                  ) : (
                    <div className="border border-neutral-300 bg-white p-8 text-neutral-600">No stories available.</div>
                  )}
                </article>
              </ScrollReveal>
              <div className="grid gap-5">
                <SectionTitle label="Developing" title="The Latest" />
                {loading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="animate-pulse border-b border-neutral-200 pb-4">
                        <div className="h-3 w-20 bg-neutral-200" />
                        <div className="mt-2 h-6 w-full bg-neutral-200" />
                        <div className="mt-2 h-4 w-3/4 bg-neutral-200" />
                      </div>
                    ))
                  : secondaryArticles.map((article, index) => (
                      <ScrollReveal key={article.id} delay={index * 60}>
                        <BriefStory article={article} onOpen={handleArticleOpen} />
                      </ScrollReveal>
                    ))}
              </div>
            </div>

            <section className="mt-8 border-t-2 border-neutral-950 pt-6">
              <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-red-800">
                    Front Page
                  </p>
                  <h2 className="font-headline text-3xl font-bold text-neutral-950">More From The District</h2>
                </div>
                <div className="flex gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                  <button
                    type="button"
                    onClick={() => setReadingDensity('comfortable')}
                    className={cn(
                      'border px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950',
                      readingDensity === 'comfortable'
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950',
                    )}
                  >
                    Comfortable
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingDensity('compact')}
                    className={cn(
                      'border px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950',
                      readingDensity === 'compact'
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950',
                    )}
                  >
                    Compact
                  </button>
                </div>
              </div>

              <div
                className={cn(
                  'grid gap-5 md:grid-cols-2',
                  readingDensity === 'compact' && 'lg:grid-cols-3',
                )}
              >
                {loading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="animate-pulse border border-neutral-200 bg-white">
                        <div className="aspect-[16/10] bg-neutral-200" />
                        <div className="p-4">
                          <div className="h-3 w-20 bg-neutral-200" />
                          <div className="mt-3 h-7 w-full bg-neutral-200" />
                          <div className="mt-3 h-4 w-5/6 bg-neutral-200" />
                        </div>
                      </div>
                    ))
                  : cardArticles.map((article, index) => (
                      <ScrollReveal key={article.id} delay={index * 50}>
                        <StoryCard article={article} onOpen={handleArticleOpen} onDismiss={dismissStory} />
                      </ScrollReveal>
                    ))}
              </div>

              {moreArticles.length > 0 && (
                <div className="mt-7 grid gap-x-8 gap-y-1 border-t border-neutral-300 pt-3 md:grid-cols-2">
                  {moreArticles.map((article) => (
                    <RailStory key={article.id} article={article} onOpen={handleArticleOpen} />
                  ))}
                </div>
              )}
            </section>
          </section>

          <aside className="space-y-6 xl:border-l-2 xl:border-neutral-950 xl:pl-6">
            <section className="border border-neutral-300 bg-white p-5">
              <div className="mb-4 flex items-start justify-between border-b-2 border-neutral-950 pb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-800">Weather</p>
                  <h2 className="font-headline text-2xl font-bold leading-none">Washington, DC</h2>
                </div>
                <Cloud className="h-8 w-8 text-neutral-500" />
              </div>
              <div className="grid grid-cols-[1fr_auto] items-end gap-4">
                <div>
                  <p className="text-6xl font-light leading-none tracking-tight">{weather.temp}&deg;</p>
                  <p className="mt-2 font-semibold text-neutral-700">{weather.condition}</p>
                  <p className="text-sm text-neutral-500">Feels like {weather.feelsLike}&deg;F</p>
                </div>
                <div className="space-y-1 text-right text-sm font-semibold text-neutral-600">
                  <p>High {weather.high}&deg;</p>
                  <p>Low {weather.low}&deg;</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-px bg-neutral-200 text-sm">
                <WeatherMetric icon={Wind} label="Wind" value={weather.wind} />
                <WeatherMetric icon={Droplets} label="Humidity" value={weather.humidity + '%'} />
                <WeatherMetric icon={Gauge} label="Pressure" value={weather.pressure + String.fromCharCode(34)} />
                <WeatherMetric icon={Thermometer} label="Dew Point" value={weather.dewPoint + 'F'} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
                <span className="inline-flex items-center gap-1.5">
                  <Sunrise className="h-3.5 w-3.5" /> {weather.sunrise}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sunset className="h-3.5 w-3.5" /> {weather.sunset}
                </span>
              </div>
            </section>

            <section className="border border-neutral-300 bg-[#fbfaf7] p-5">
              <SectionTitle label="Civic Briefing" title="Today In DC" />
              <ul className="space-y-4">
                {civicBriefs.map((brief, index) => (
                  <li key={brief} className="grid grid-cols-[32px_1fr] gap-3">
                    <span className="flex h-8 w-8 items-center justify-center border border-neutral-300 bg-white text-xs font-black text-red-800">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold leading-6 text-neutral-700">{brief}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid gap-3 border border-neutral-300 bg-white p-5">
              <SectionTitle label="Services" title="District Status" />
              <StatusRow icon={TrainFront} label="Metro" value="Normal service with advisories" />
              <StatusRow icon={ShieldCheck} label="Public Safety" value="Community notices active" />
              <StatusRow icon={Landmark} label="Council" value="Hearings and filings posted" />
              <StatusRow icon={MapPin} label="Roads" value="Check DDOT before crossing town" />
            </section>
            <section className="border border-neutral-300 bg-white p-5">
              <SectionTitle label="Most Read" title="Reader Agenda" />
              <ol className="space-y-4">
                {mostReadStories.map((story, index) => (
                  <li key={story} className="grid grid-cols-[40px_1fr] gap-3 border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                    <span className="font-headline text-3xl font-bold leading-none text-neutral-300">
                      {index + 1}
                    </span>
                    <a href="#" className="text-sm font-bold leading-5 text-neutral-900 hover:text-red-800">
                      {story}
                    </a>
                  </li>
                ))}
              </ol>
            </section>

            <section className="border border-neutral-300 bg-white p-5">
              <SectionTitle label="For You" title="Reading Queue" />
              {recommendedArticles.length > 0 ? (
                <div className="space-y-1">
                  {recommendedArticles.map((article) => (
                    <RailStory key={article.id} article={article} onOpen={handleArticleOpen} />
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-neutral-600">
                  Open a few stories and DC4 will keep a local reading queue in this browser.
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-200 pt-4 text-xs font-bold uppercase tracking-[0.12em]">
                <button type="button" onClick={restoreDismissedStories} className="text-red-800 hover:underline">
                  Restore hidden ({dismissedStories.length})
                </button>
                <button type="button" onClick={clearContinueReading} className="text-neutral-700 hover:underline">
                  Clear queue
                </button>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-neutral-500">
                Saved section: {selectedCategory}. Preferences stay in this browser only.
              </p>
            </section>

            {continueReading.length > 0 && (
              <section className="border border-neutral-300 bg-white p-5">
                <SectionTitle label="Continue" title="Recently Opened" />
                <ul className="space-y-3">
                  {continueReading.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm font-bold leading-5 text-neutral-950 hover:text-red-800"
                      >
                        {item.title}
                      </a>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                        {item.category} / {item.sourceName}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="border-2 border-neutral-950 bg-neutral-950 p-5 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-300">Tip Line</p>
              <h2 className="mt-2 font-headline text-2xl font-bold leading-tight">Know something the District should know?</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Send documents, photos, calendar notices, corrections, or neighborhood leads to the DC4 desk.
              </p>
              <a
                href="mailto:ciao_chris@proton.me"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 border border-white bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-neutral-950 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              >
                <Mail className="h-4 w-4" /> Contact The Desk
              </a>
            </section>
          </aside>
        </div>
      </main>

      <footer className="mt-10 border-t-2 border-neutral-950 bg-[#111111] text-neutral-300">
        <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <img src={dc4Logo} alt="DC4 News" className="h-10 w-auto brightness-0 invert" />
              <p className="mt-4 max-w-md text-sm leading-6 text-neutral-400">
                DC4 News is an independent Washington, DC front page built for local reporting, public service updates, and civic attention.
              </p>
            </div>
            <FooterList title="Coverage" items={['Local', 'Politics', 'Transit', 'Weather']} />
            <FooterList title="Public File" items={['Corrections', 'Accessibility', 'Privacy', 'Terms']} />
            <FooterList title="Newsroom" items={['Tip Line', 'Advertise', 'Careers', 'Contact']} />
          </div>
          <div className="mt-8 flex flex-col justify-between gap-3 border-t border-neutral-800 pt-5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 md:flex-row">
            <p>Copyright 2026 DC4 News. Washington, District of Columbia.</p>
            <p>Built for residents, commuters, and public record readers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DCNewsLanding;
