import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

// Fallback static articles per category
const FALLBACK_ARTICLES: NewsArticle[] = [
  {
    id: 'fb-local-1',
    category: 'Local',
    title: 'Metro Board Approves FY2027 Budget Amid Ridership Recovery',
    description: 'WMATA officials unveiled a $2.1 billion operating budget focused on increasing service frequency and improving reliability across all rail and bus lines.',
    content: '',
    url: 'https://www.wmata.com',
    image: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=600&h=400&fit=crop',
    publishedAt: new Date().toISOString(),
    source: { name: 'Washington Metro Report', url: 'https://www.wmata.com' }
  },
  {
    id: 'fb-local-2',
    category: 'Local',
    title: 'DC Launches New Community Investment Program in Ward 8',
    description: 'The mayor announced a $50 million initiative targeting economic development and community services east of the Anacostia River.',
    content: '',
    url: 'https://dc.gov',
    image: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: 'DC Government', url: 'https://dc.gov' }
  },
  {
    id: 'fb-politics-1',
    category: 'Politics',
    title: 'DC Council Passes Affordable Housing Legislation',
    description: 'New bill mandates 30% of new residential developments in high-density zones include affordable units, effective January 2027.',
    content: '',
    url: 'https://dc.gov',
    image: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: 'DC Wire', url: 'https://dc.gov' }
  },
  {
    id: 'fb-politics-2',
    category: 'Politics',
    title: 'Congressional Committee Holds Hearing on DC Statehood',
    description: 'Advocates and lawmakers renewed calls for DC statehood during a packed hearing on Capitol Hill.',
    content: '',
    url: 'https://www.congress.gov',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    source: { name: 'Capitol Report', url: 'https://www.congress.gov' }
  },
  {
    id: 'fb-crime-1',
    category: 'Crime & Safety',
    title: 'MPD Reports 15% Drop in Violent Crime Across District',
    description: 'Metropolitan Police Chief credits community policing initiatives and expanded surveillance technology for the continued decline.',
    content: '',
    url: 'https://mpdc.dc.gov',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: 'MPD News', url: 'https://mpdc.dc.gov' }
  },
  {
    id: 'fb-crime-2',
    category: 'Crime & Safety',
    title: 'New Safety Cameras Installed Along Pennsylvania Avenue Corridor',
    description: 'DC government deploys 200 additional traffic and safety cameras in high-traffic areas downtown.',
    content: '',
    url: 'https://dc.gov',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: 'DC Safety Watch', url: 'https://dc.gov' }
  },
  {
    id: 'fb-weather-1',
    category: 'Weather',
    title: 'National Cherry Blossom Festival Announces Peak Bloom Window',
    description: 'The National Park Service expects peak bloom around April 8-15, with enhanced pedestrian safety measures planned around the Tidal Basin.',
    content: '',
    url: 'https://www.nps.gov',
    image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: 'NPS News', url: 'https://www.nps.gov' }
  },
  {
    id: 'fb-weather-2',
    category: 'Weather',
    title: 'DC Area Braces for Unseasonably Warm Spring Temperatures',
    description: 'Meteorologists predict temperatures 10-15 degrees above average through mid-March, raising concerns about early allergen season.',
    content: '',
    url: 'https://weather.gov',
    image: 'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: 'NWS DC', url: 'https://weather.gov' }
  },
  {
    id: 'fb-traffic-1',
    category: 'Traffic',
    title: 'WMATA Extends Silver Line Service Hours for Spring',
    description: 'Metro announces expanded late-night service on Silver Line to support growing ridership to Dulles and Tysons.',
    content: '',
    url: 'https://www.wmata.com',
    image: 'https://images.unsplash.com/photo-1581262177000-8139a463e531?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: 'WMATA', url: 'https://www.wmata.com' }
  },
  {
    id: 'fb-traffic-2',
    category: 'Traffic',
    title: 'Major Road Closures Planned for Rock Creek Parkway This Weekend',
    description: 'DDOT announces temporary closures for infrastructure repairs, with detour routes available via Connecticut Avenue.',
    content: '',
    url: 'https://ddot.dc.gov',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: 'DDOT', url: 'https://ddot.dc.gov' }
  },
  {
    id: 'fb-sports-1',
    category: 'Sports',
    title: 'Commanders Announce Draft Day Fan Event at Nationals Park',
    description: 'Washington Commanders will host a massive watch party for the 2026 NFL Draft with player appearances and live entertainment.',
    content: '',
    url: 'https://www.commanders.com',
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: 'Commanders Wire', url: 'https://www.commanders.com' }
  },
  {
    id: 'fb-sports-2',
    category: 'Sports',
    title: 'Nationals Open Spring Training with New Pitching Roster',
    description: 'Washington Nationals debut several key offseason acquisitions as the team looks to contend in the NL East.',
    content: '',
    url: 'https://www.mlb.com/nationals',
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: 'MLB.com', url: 'https://www.mlb.com/nationals' }
  },
  {
    id: 'fb-entertainment-1',
    category: 'Entertainment',
    title: 'Smithsonian Announces Major Renovation of National Air and Space Museum',
    description: 'The museum will close for 18 months starting July for comprehensive infrastructure upgrades and exhibit modernization.',
    content: '',
    url: 'https://www.si.edu',
    image: 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: 'Smithsonian Insider', url: 'https://www.si.edu' }
  },
  {
    id: 'fb-entertainment-2',
    category: 'Entertainment',
    title: 'Kennedy Center Unveils 2026-2027 Performance Season',
    description: 'The upcoming season features world premieres, Broadway hits, and an expanded jazz series celebrating DC\'s musical heritage.',
    content: '',
    url: 'https://www.kennedy-center.org',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=400&fit=crop',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: 'Kennedy Center', url: 'https://www.kennedy-center.org' }
  },
];

function getFallbackForCategory(category: string): NewsArticle[] {
  if (!category || category === 'All') return FALLBACK_ARTICLES;
  return FALLBACK_ARTICLES.filter(a => a.category === category);
}

export const useDCNews = (category?: string) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setArticles(getFallbackForCategory(category || 'All'));
      setError('Backend is not configured. Showing fallback news.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-dc-news', {
        body: { category: category || 'All' },
        headers: { 'Content-Type': 'application/json' },
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to fetch news');
      }

      if (data?.articles && data.articles.length > 0) {
        setArticles(data.articles);
      } else {
        // Use category-specific fallback if API returns no results
        setArticles(getFallbackForCategory(category || 'All'));
      }
    } catch (err) {
      console.error('News fetch failed, using fallback:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      setArticles(getFallbackForCategory(category || 'All'));
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();

    // Auto-refresh news every 5 minutes for live updates
    const interval = setInterval(fetchNews, 5 * 60 * 1000);

    // Also refresh when the tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchNews();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchNews]);

  const refresh = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, refresh };
};
