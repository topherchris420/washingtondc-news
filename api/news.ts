import type { IncomingMessage, ServerResponse } from 'node:http';

const categoryKeywords: Record<string, string> = {
  Local: '"Washington DC" OR "Washington D.C." OR "District of Columbia"',
  Politics: '"Washington DC" OR "D.C. Council" OR "Capitol Hill" politics',
  'Crime & Safety': '"Washington DC" OR "D.C. police" OR "MPD" crime',
  Weather: '"Washington DC" OR "D.C. area" weather',
  Traffic: '"Washington DC" OR "WMATA" OR "Metro" transit traffic',
  Sports: '"Washington DC" Commanders OR Nationals OR Capitals OR Wizards',
  Entertainment: '"Washington DC" OR "Smithsonian" OR "Kennedy Center" entertainment',
  All: '"Washington DC" OR "Washington D.C."',
};

interface GNewsArticle {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string | null;
  publishedAt?: string;
  source?: { name?: string; url?: string };
}

const sendJson = (response: ServerResponse, status: number, body: unknown) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
};

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: 'News provider is not configured' });
    return;
  }

  const requestUrl = new URL(request.url || '/api/news', 'http://localhost');
  const requestedCategory = requestUrl.searchParams.get('category') || 'All';
  const category = categoryKeywords[requestedCategory] ? requestedCategory : 'All';
  const providerUrl = new URL('https://gnews.io/api/v4/search');
  providerUrl.searchParams.set('q', categoryKeywords[category]);
  providerUrl.searchParams.set('lang', 'en');
  providerUrl.searchParams.set('country', 'us');
  providerUrl.searchParams.set('max', '10');
  providerUrl.searchParams.set('apikey', apiKey);

  try {
    const providerResponse = await fetch(providerUrl);
    if (!providerResponse.ok) {
      sendJson(response, 502, { error: 'News provider request failed' });
      return;
    }

    const data = (await providerResponse.json()) as { articles?: GNewsArticle[] };
    const articles = (data.articles || []).map((article, index) => ({
      id: `gnews-${article.publishedAt || Date.now()}-${index}`,
      category: category === 'All' ? 'Local' : category,
      title: article.title || 'Untitled',
      description: article.description || '',
      content: article.content || '',
      url: article.url || '#',
      image: article.image || null,
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: {
        name: article.source?.name || 'Unknown',
        url: article.source?.url || '#',
      },
    }));

    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    sendJson(response, 200, { articles });
  } catch (error) {
    console.error('News API request failed:', error);
    sendJson(response, 502, { error: 'Unable to retrieve live news' });
  }
}
