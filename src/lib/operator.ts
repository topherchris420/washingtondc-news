import type { NewsArticle } from '@/hooks/useDCNews';

export type OperatorChannel = 'feed' | 'signals' | 'archive' | 'sources' | 'notes' | 'library' | 'timeline';

export interface OperatorRecord {
  id: string;
  article: NewsArticle;
  source: string;
  domain: string;
  category: string;
  timestamp: string;
  relatedIds: string[];
  wordCount: number;
}

export const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'local-record';
  }
};

export const createOperatorRecords = (articles: NewsArticle[]): OperatorRecord[] =>
  articles.map((article, index) => ({
    id: `R-${String(index + 1).padStart(3, '0')}`,
    article,
    source: article.source.name,
    domain: getDomain(article.url || article.source.url),
    category: article.category || 'Local',
    timestamp: article.publishedAt,
    wordCount: `${article.title} ${article.description} ${article.content}`.trim().split(/\s+/).length,
    relatedIds: articles
      .map((candidate, candidateIndex) => ({ candidate, candidateIndex }))
      .filter(({ candidate, candidateIndex }) =>
        candidateIndex !== index &&
        (candidate.category === article.category || candidate.source.name === article.source.name),
      )
      .slice(0, 3)
      .map(({ candidateIndex }) => `R-${String(candidateIndex + 1).padStart(3, '0')}`),
  }));

export const OPERATOR_CHANNELS: { id: OperatorChannel; label: string; key: string }[] = [
  { id: 'feed', label: 'LIVE FEED', key: '1' },
  { id: 'signals', label: 'SIGNALS', key: '2' },
  { id: 'archive', label: 'ARCHIVE', key: '3' },
  { id: 'sources', label: 'SOURCES', key: '4' },
  { id: 'notes', label: 'NOTES', key: '5' },
  { id: 'library', label: 'LIBRARY', key: '6' },
];

export interface OperatorCommandContext {
  records: OperatorRecord[];
  setChannel: (channel: OperatorChannel) => void;
  setSelectedId: (id: string) => void;
  setQuery: (query: string) => void;
  exit: () => void;
}

export interface OperatorCommandResult {
  lines: string[];
  clear?: boolean;
}

export interface OperatorCommand {
  name: string;
  usage: string;
  description: string;
  execute: (args: string[], context: OperatorCommandContext) => OperatorCommandResult;
}

const openChannel = (channel: OperatorChannel, label: string): OperatorCommand['execute'] => (_args, context) => {
  context.setChannel(channel);
  return { lines: [`WORKSPACE: ${label}`] };
};

export const OPERATOR_COMMANDS: OperatorCommand[] = [
  {
    name: 'help', usage: 'help', description: 'list local console commands',
    execute: () => ({ lines: OPERATOR_COMMANDS.map(({ usage, description }) => `${usage.padEnd(18)} ${description}`) }),
  },
  {
    name: 'status', usage: 'status', description: 'show workstation state',
    execute: (_args, context) => ({ lines: ['SESSION: ACTIVE / LOCAL', 'NETWORK: CONTROLLED', `RECORDS: ${context.records.length}`, 'REMOTE ACCESS: DISABLED'] }),
  },
  { name: 'feed', usage: 'feed', description: 'open live feed', execute: openChannel('feed', 'LIVE FEED') },
  { name: 'sources', usage: 'sources', description: 'index public sources', execute: openChannel('sources', 'SOURCES') },
  { name: 'signals', usage: 'signals', description: 'show local signal summary', execute: openChannel('signals', 'SIGNALS') },
  { name: 'archive', usage: 'archive', description: 'open local archive', execute: openChannel('archive', 'ARCHIVE') },
  { name: 'timeline', usage: 'timeline', description: 'order records by time', execute: openChannel('timeline', 'TIMELINE') },
  {
    name: 'inspect', usage: 'inspect <id>', description: 'select a record',
    execute: ([rawId], context) => {
      const id = rawId?.toUpperCase();
      const record = context.records.find((item) => item.id === id || item.article.id === rawId);
      if (!record) return { lines: ['ERR: RECORD NOT FOUND'] };
      context.setSelectedId(record.id);
      return { lines: [`INSPECTOR: ${record.id}`, record.article.title] };
    },
  },
  {
    name: 'search', usage: 'search <term>', description: 'filter local records',
    execute: (args, context) => {
      const query = args.join(' ').trim();
      if (!query) return { lines: ['USAGE: search <term>'] };
      context.setQuery(query);
      context.setChannel('library');
      return { lines: [`LOCAL SEARCH: ${query.toUpperCase()}`] };
    },
  },
  { name: 'clear', usage: 'clear', description: 'clear console output', execute: () => ({ lines: [], clear: true }) },
  { name: 'exit', usage: 'exit', description: 'return to DC4 News', execute: (_args, context) => { context.exit(); return { lines: ['SESSION CLOSED'] }; } },
];

export const runOperatorCommand = (input: string, context: OperatorCommandContext): OperatorCommandResult => {
  const [rawName = '', ...args] = input.trim().split(/\s+/);
  const command = OPERATOR_COMMANDS.find(({ name }) => name === rawName.toLowerCase());
  return command ? command.execute(args, context) : { lines: [`ERR: UNKNOWN COMMAND '${rawName}'`, "TYPE 'help' FOR INDEX"] };
};
