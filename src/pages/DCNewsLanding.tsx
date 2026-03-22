import { useState } from 'react'; // live data v2
import dc4Logo from '@/assets/dc4-news-logo.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Cloud, Thermometer, Wind, ExternalLink, Mail, X, ImageOff, Droplets, Sun, Sunrise, Sunset, Eye, Gauge, ChevronRight } from 'lucide-react';
import { FeaturedStoryCard } from '@/components/FeaturedStoryCard';
import { useDCNews } from '@/hooks/useDCNews';
import { useNewsPreferences } from '@/hooks/useNewsPreferences';
import { useDCWeather } from '@/hooks/useDCWeather';
import { ScrollReveal } from '@/components/ScrollReveal';
import { resolveCovcomSignal } from '@/lib/covcom';

const DCNewsLanding = () => {
  const [searchValue, setSearchValue] = useState('');
  const navLinks = ['Local', 'Politics', 'Crime & Safety', 'Weather', 'Traffic', 'Sports', 'Entertainment'] as const;
  const [activeCategory, setActiveCategory] = useState<(typeof navLinks)[number]>(navLinks[0]);
  const { articles, loading } = useDCNews(activeCategory);
  const {
    selectedCategory, dismissedStories, dismissStory, restoreDismissedStories,
    readingDensity, setReadingDensity, viewedCategories, continueReading,
    trackArticleView, clearContinueReading,
  } = useNewsPreferences();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const action = resolveCovcomSignal(searchValue);

    if (action.type === 'redirect') {
      window.location.href = action.destination;
      return;
    }

    if (action.type === 'open-contact') {
      window.location.href = 'mailto:ciao_chris@proton.me';
    }
  };

  const sidebarStories = [
    "Council approves new bike lane network for NW",
    "Nationals announce spring training roster changes",
    "Local chef wins James Beard Award nomination",
    "New art installation opens at Union Market",
    "Weekend road closures planned for Marathon prep",
  ];

  const getArticleCategory = (title: string, sourceName: string) => {
    const content = `${title} ${sourceName}`.toLowerCase();

    if (content.includes('police') || content.includes('security') || content.includes('crime')) return 'Crime & Safety';
    if (content.includes('weather') || content.includes('bloom')) return 'Weather';
    if (content.includes('metro') || content.includes('airport') || content.includes('traffic')) return 'Traffic';
    if (content.includes('council') || content.includes('capitol') || content.includes('budget')) return 'Politics';
    if (content.includes('nationals') || content.includes('sports')) return 'Sports';
    if (content.includes('museum') || content.includes('zoo') || content.includes('festival')) return 'Entertainment';

    return 'Local';
  };

  const visibleArticles = articles
    .filter((article) => !dismissedStories.includes(article.id))
    .filter((article) => selectedCategory === 'All' || getArticleCategory(article.title, article.source.name) === selectedCategory);

  const breakingArticle = articles[0];
  const gridArticles = visibleArticles.slice(1, 5);
  const moreArticles = visibleArticles.slice(5, 9);

  const forYouArticles = articles
    .filter((article) => !dismissedStories.includes(article.id))
    .filter((article) => viewedCategories.includes(getArticleCategory(article.title, article.source.name)))
    .slice(0, 3);

  const densityCardClass = readingDensity === 'compact' ? 'p-3' : 'p-5';

  const handleArticleOpen = (article: (typeof articles)[number]) => {
    trackArticleView({
      id: article.id,
      title: article.title,
      url: article.url,
      sourceName: article.source.name,
      category: getArticleCategory(article.title, article.source.name),
    });

    window.open(article.url, '_blank');
  };

  // Format published time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'Just now';
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Get current date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Live weather data
  const { weather } = useDCWeather();

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-blue-900 focus:px-4 focus:py-2 focus:rounded-sm focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
      >
        Skip to main content
      </a>

      {/* Top Bar */}
      <div className="bg-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs tracking-wide">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">{weather.icon} {weather.temp}°F</span>
            <span className="flex items-center gap-1.5 font-medium"><Cloud className="h-3 w-3 opacity-70" /> {weather.condition}</span>
            <span className="hidden sm:flex items-center gap-1.5 text-blue-300">Feels {weather.feelsLike}°</span>
            <span className="hidden md:flex items-center gap-1.5 font-medium"><Wind className="h-3 w-3 opacity-70" /> {weather.wind}</span>
            <span className="hidden lg:flex items-center gap-1.5 font-medium"><Droplets className="h-3 w-3 opacity-70" /> {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-blue-200">{today}</span>
            <span className="text-blue-500 hidden sm:inline">|</span>
            <span className="text-red-400 font-bold text-[11px] tracking-widest flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <header className="bg-white border-b-[3px] border-blue-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <img src={dc4Logo} alt="DC4 News" className="h-10 md:h-12 w-auto" />
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search stories..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-8 h-9 w-36 md:w-52 text-sm border-gray-200 rounded-md bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <Button type="submit" size="sm" className="h-9 bg-blue-900 hover:bg-blue-800 rounded-md text-xs px-4 font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-700">
                Go
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2.5 md:py-2">
          <div className="hidden md:flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-0.5 rounded-full border border-blue-700/50 bg-blue-950/60 p-1">
              {navLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => setActiveCategory(link)}
                  aria-pressed={activeCategory === link}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900 ${
                    activeCategory === link
                      ? 'bg-white text-blue-900 shadow-md'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link}
                </button>
              ))}
            </div>
            <a
              href="mailto:ciao_chris@proton.me"
              className="px-5 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-500 transition-all duration-200 flex items-center gap-2 whitespace-nowrap rounded-md shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            >
              <Mail className="h-4 w-4" />
              Contact
            </a>
          </div>

          <div className="md:hidden space-y-2">
            <div>
              <Select value={activeCategory} onValueChange={(value) => setActiveCategory(value as (typeof navLinks)[number])}>
                <SelectTrigger className="h-10 border-blue-700 bg-blue-950 text-white rounded-md focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {navLinks.map((link) => (
                    <SelectItem key={link} value={link}>{link}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <a
              href="mailto:ciao_chris@proton.me"
              className="h-10 px-4 text-sm font-bold bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-2 rounded-md"
            >
              <Mail className="h-4 w-4" />
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Breaking News Ticker */}
      <div className="bg-red-700 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 text-sm">
          <span className="bg-white text-red-700 px-2.5 py-0.5 rounded text-[11px] font-black tracking-wider shrink-0 shadow-sm">BREAKING</span>
          <div className="overflow-hidden">
            <p className="font-medium truncate">
              {loading ? 'Loading latest news...' : breakingArticle?.title || 'Refresh for latest updates'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 py-8" tabIndex={-1}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-0">
            {/* Lead Story */}
            {visibleArticles.length > 0 && (
              <ScrollReveal>
                <div className="mb-6">
                  <FeaturedStoryCard article={visibleArticles[0]} formatTime={formatTime} />
                </div>
              </ScrollReveal>
            )}

            {/* Article Grid */}
            <div className="grid md:grid-cols-2 gap-5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-100 p-5 animate-pulse shadow-sm">
                    <div className="h-36 bg-gray-100 rounded-md mb-4"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded-full mb-3"></div>
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded mb-1"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-3 w-1/3 bg-gray-100 rounded-full mt-4"></div>
                  </div>
                ))
              ) : (
                gridArticles.map((article, idx) => (
                  <ScrollReveal key={article.id} delay={idx * 100}>
                    <article
                      className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full overflow-hidden shadow-sm"
                      onClick={() => handleArticleOpen(article)}
                    >
                      <div className="h-40 bg-gray-100 overflow-hidden rounded-t-lg">
                        {article.image ? (
                          <img src={article.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                            <ImageOff className="h-4 w-4 mr-1.5 opacity-50" /> No image
                          </div>
                        )}
                      </div>
                      <div className={densityCardClass}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-full">
                            {article.source.name}
                          </span>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              dismissStory(article.id);
                            }}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                            aria-label="Dismiss story"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-900 transition-colors font-headline">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                          {article.description}
                        </p>
                        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 opacity-60" /> {formatTime(article.publishedAt)}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-60" />
                        </div>
                      </div>
                    </article>
                  </ScrollReveal>
                ))
              )}
            </div>

            {/* More Articles */}
            {!loading && moreArticles.length > 0 && (
              <div className="mt-6 grid md:grid-cols-2 gap-5">
                {moreArticles.map((article, idx) => (
                  <ScrollReveal key={article.id} delay={idx * 80}>
                    <article
                      className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer flex gap-4 overflow-hidden shadow-sm"
                      onClick={() => handleArticleOpen(article)}
                    >
                      {article.image && (
                        <div className="w-28 h-28 shrink-0 overflow-hidden rounded-l-lg">
                          <img src={article.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        </div>
                      )}
                      <div className="p-3 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-gray-900 mb-1.5 leading-snug group-hover:text-blue-900 transition-colors font-headline">
                          {article.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {article.description}
                        </p>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
                          <Clock className="h-2.5 w-2.5 opacity-60" /> {formatTime(article.publishedAt)}
                        </span>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <ScrollReveal>
              <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b-2 border-blue-900 pb-2 mb-4">Your Preferences</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1.5">Reading density</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReadingDensity('comfortable')}
                        className={`px-3 py-1.5 rounded-md border transition-all duration-200 ${readingDensity === 'comfortable' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        Comfortable
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadingDensity('compact')}
                        className={`px-3 py-1.5 rounded-md border transition-all duration-200 ${readingDensity === 'compact' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        Compact
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Saved category</p>
                    <p className="text-gray-500 mt-0.5">{selectedCategory}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={restoreDismissedStories} className="text-blue-700 hover:text-blue-900 hover:underline transition-colors">
                      Restore dismissed ({dismissedStories.length})
                    </button>
                    <button type="button" onClick={clearContinueReading} className="text-blue-700 hover:text-blue-900 hover:underline transition-colors">
                      Clear continue reading
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">Preferences stay in this browser only. No remote tracking.</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={60}>
              <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b-2 border-emerald-600 pb-2 mb-4">Recommended</h3>
                {(() => {
                  const recommended = forYouArticles.length > 0 ? forYouArticles : articles.slice(2, 5);
                  return recommended.length > 0 ? (
                    <ul className="space-y-2.5">
                      {recommended.map((article) => (
                        <li key={article.id}>
                          <button type="button" onClick={() => handleArticleOpen(article)} className="text-left w-full text-sm text-gray-700 hover:text-blue-900 leading-snug transition-colors font-medium">
                            {article.title}
                          </button>
                          <p className="text-[10px] text-gray-400 mt-0.5">{article.source.name} • {formatTime(article.publishedAt)}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null;
                })()}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b-2 border-violet-600 pb-2 mb-4">Latest Updates</h3>
                {(() => {
                  const latestItems = continueReading.length > 0
                    ? continueReading
                    : articles.slice(5, 9).map((a) => ({
                        id: a.id,
                        title: a.title,
                        url: a.url,
                        sourceName: a.source.name,
                        category: getArticleCategory(a.title, a.source.name),
                      }));
                  return latestItems.length > 0 ? (
                    <ul className="space-y-2.5">
                      {latestItems.map((item) => (
                        <li key={item.id}>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:text-blue-900 leading-snug transition-colors font-medium">
                            {item.title}
                          </a>
                          <p className="text-[11px] text-gray-400 mt-0.5">{item.category} • {item.sourceName}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null;
                })()}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={90}>
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                {/* Weather Header */}
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-black uppercase tracking-wider opacity-80">Washington, DC Weather</h3>
                    <span className="text-[10px] opacity-60">Updated live</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-extralight tabular-nums leading-none">{weather.temp}°</span>
                        <span className="text-3xl mb-0.5">{weather.icon}</span>
                      </div>
                      <p className="text-sm font-medium mt-2 text-blue-100">{weather.condition}</p>
                      <p className="text-xs text-blue-300 mt-0.5">Feels like {weather.feelsLike}°F</p>
                    </div>
                    <div className="text-right text-xs space-y-1">
                      <p className="text-blue-100"><span className="text-red-300">↑</span> <span className="font-semibold text-white">{weather.high}°</span></p>
                      <p className="text-blue-100"><span className="text-blue-300">↓</span> <span className="font-semibold text-white">{weather.low}°</span></p>
                    </div>
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-3 gap-px bg-gray-100">
                  <div className="bg-white p-3 text-center">
                    <Wind className="h-3.5 w-3.5 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs font-semibold text-gray-800">{weather.wind}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Wind</p>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <Droplets className="h-3.5 w-3.5 mx-auto text-blue-400 mb-1" />
                    <p className="text-xs font-semibold text-gray-800">{weather.humidity}%</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Humidity</p>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <Cloud className="h-3.5 w-3.5 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs font-semibold text-gray-800">{weather.precipChance}%</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Precip</p>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <Sun className="h-3.5 w-3.5 mx-auto text-amber-400 mb-1" />
                    <p className="text-xs font-semibold text-gray-800">{weather.uvIndex}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">UV Index</p>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <Gauge className="h-3.5 w-3.5 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs font-semibold text-gray-800">{weather.pressure}"</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Pressure</p>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <Thermometer className="h-3.5 w-3.5 mx-auto text-teal-400 mb-1" />
                    <p className="text-xs font-semibold text-gray-800">{weather.dewPoint}°F</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Dew Point</p>
                  </div>
                </div>

                {/* Sunrise / Sunset */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 text-xs text-gray-600 border-t border-gray-100">
                  <span className="flex items-center gap-1.5"><Sunrise className="h-3.5 w-3.5 text-amber-500" /> {weather.sunrise}</span>
                  <span className="flex items-center gap-1.5"><Sunset className="h-3.5 w-3.5 text-orange-400" /> {weather.sunset}</span>
                </div>

                {/* Hourly Forecast */}
                {weather.hourly.length > 0 && (
                  <div className="border-t border-gray-100">
                    <div className="px-5 pt-3 pb-1 flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Hourly</h4>
                    </div>
                    <div className="flex overflow-x-auto px-3 pb-3 gap-0 scrollbar-hide">
                      {weather.hourly.slice(0, 8).map((hour, i) => (
                        <div key={i} className="flex flex-col items-center min-w-[3.5rem] py-2 px-1">
                          <span className="text-[10px] text-gray-500 font-medium">{i === 0 ? 'Now' : hour.time}</span>
                          <span className="text-base my-1">{hour.icon}</span>
                          <span className="text-xs font-semibold text-gray-800">{hour.temp}°</span>
                          {hour.precipChance > 0 && (
                            <span className="text-[9px] text-blue-500 font-medium mt-0.5">{hour.precipChance}%</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7-Day Forecast */}
                {weather.daily.length > 0 && (
                  <div className="border-t border-gray-100">
                    <div className="px-5 pt-3 pb-1">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">7-Day Forecast</h4>
                    </div>
                    <div className="px-5 pb-4">
                      {weather.daily.map((day, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <span className="text-xs font-semibold text-gray-700 w-12">{day.day}</span>
                          <span className="text-base w-8 text-center">{day.icon}</span>
                          {day.precipChance > 0 ? (
                            <span className="text-[10px] text-blue-500 font-medium w-8 text-center">{day.precipChance}%</span>
                          ) : (
                            <span className="w-8" />
                          )}
                          <div className="flex items-center gap-1.5 text-xs tabular-nums">
                            <span className="font-semibold text-gray-800 w-7 text-right">{day.high}°</span>
                            <div className="w-12 h-1 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-300 to-orange-400"
                                style={{ width: `${Math.min(100, Math.max(20, ((day.high - day.low) / 40) * 100))}%` }}
                              />
                            </div>
                            <span className="text-gray-400 w-7 text-right">{day.low}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Most Read */}
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b-2 border-red-600 pb-2 mb-4">Most Read</h3>
                <ol className="space-y-3.5">
                  {sidebarStories.map((story, i) => (
                    <li key={i} className="flex items-start gap-3 group cursor-pointer">
                      <span className={`text-2xl font-black leading-none select-all ${
                        [0, 2, 6].includes(i) 
                          ? 'text-red-600/30 hover:text-red-600 transition-all duration-500 animate-[subtle-glow_4s_ease-in-out_infinite] font-headline' 
                          : 'text-gray-200'
                      }`} style={[0, 2, 6].includes(i) ? { letterSpacing: '0.05em', animationDelay: `${i * 0.7}s` } : {}}>{i + 1}</span>
                      <p className="text-sm text-gray-700 leading-snug group-hover:text-blue-900 transition-colors font-medium pt-0.5">
                        {story}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </ScrollReveal>

            {/* Contact CTA */}
            <ScrollReveal delay={200}>
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-5 rounded-lg shadow-md">
                <h3 className="text-xs font-black uppercase tracking-wider mb-2">Get In Touch</h3>
                <p className="text-xs text-red-100 mb-4">Have a story tip or want to connect?</p>
                <a
                  href="mailto:ciao_chris@proton.me"
                  className="flex items-center justify-center gap-2 w-full h-10 bg-white text-red-700 hover:bg-red-50 rounded-md text-sm font-bold transition-all duration-200 shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-red-600 focus-visible:ring-white"
                >
                  <Mail className="h-4 w-4" />
                  Email Us
                </a>
              </div>
            </ScrollReveal>

          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Neighborhoods</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Capitol Hill</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Georgetown</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dupont Circle</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Adams Morgan</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Government</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">DC Council</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mayor's Office</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Federal Updates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Public Records</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Sections</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Investigations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Opinion</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Obituaries</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Classifieds</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Connect</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Tip Line</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Advertise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="mailto:ciao_chris@proton.me" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; 2026 Washington <span className="font-bold text-white">4</span> News. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
              <span className="text-gray-700">v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DCNewsLanding;
