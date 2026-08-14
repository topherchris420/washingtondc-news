import { useEffect, useMemo, useRef, useState } from 'react';
import type { NewsArticle } from '@/hooks/useDCNews';
import {
  createOperatorRecords,
  OPERATOR_CHANNELS,
  OPERATOR_COMMANDS,
  runOperatorCommand,
  type OperatorChannel,
  type OperatorRecord,
} from '@/lib/operator';
import { cn } from '@/lib/utils';

const BOOT_LINES = [
  'DC4 // AUXILIARY SYSTEM',
  '',
  'SIGNAL ACCEPTED',
  'CHANNEL: LIBRARY-ACCESS',
  '',
  'VERIFYING SESSION........OK',
  'LOADING LOCAL ARCHIVE.....OK',
  'NETWORK STATE.............CONTROLLED',
  'OPERATOR INTERFACE........READY',
  '',
  '>',
];
const NOTES_KEY = 'dc4:operator-notes';
const HISTORY_KEY = 'dc4:operator-history';

interface OperatorModeProps {
  articles: NewsArticle[];
  loading: boolean;
  enteredAt: Date;
  onExit: () => void;
}

const formatUtc = (value: Date) => value.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
const recordSearchText = (record: OperatorRecord) =>
  `${record.id} ${record.article.title} ${record.article.description} ${record.source} ${record.category} ${record.domain}`.toLowerCase();

export function OperatorMode({ articles, loading, enteredAt, onExit }: OperatorModeProps) {
  const records = useMemo(() => createOperatorRecords(articles), [articles]);
  const [booting, setBooting] = useState(true);
  const [bootCount, setBootCount] = useState(0);
  const [clock, setClock] = useState(new Date());
  const [channel, setChannel] = useState<OperatorChannel>('feed');
  const [selectedId, setSelectedId] = useState('R-001');
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState(() => localStorage.getItem(NOTES_KEY) ?? '');
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as string[]; } catch { return []; }
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [consoleLines, setConsoleLines] = useState<string[]>([
    'DC4 LOCAL CONSOLE  //  TYPE help FOR COMMAND INDEX',
    'NOTICE: PUBLIC NEWS SOURCES / LOCAL DERIVATIONS ONLY',
  ]);
  const commandRef = useRef<HTMLInputElement>(null);

  const selected = records.find((record) => record.id === selectedId) ?? records[0];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? records.filter((record) => recordSearchText(record).includes(normalized)) : records;
  }, [query, records]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setBootCount(BOOT_LINES.length);
      const timer = window.setTimeout(() => setBooting(false), 350);
      return () => window.clearTimeout(timer);
    }
    const interval = window.setInterval(() => setBootCount((count) => Math.min(count + 1, BOOT_LINES.length)), 190);
    const timer = window.setTimeout(() => setBooting(false), BOOT_LINES.length * 190 + 450);
    return () => { window.clearInterval(interval); window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => localStorage.setItem(NOTES_KEY, notes), [notes]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (booting) return;
      if (event.key === 'Escape') { onExit(); return; }
      if (event.key === '/' && document.activeElement !== commandRef.current && document.activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault(); commandRef.current?.focus();
      }
      if (event.altKey) {
        const target = OPERATOR_CHANNELS.find((item) => item.key === event.key);
        if (target) { event.preventDefault(); setChannel(target.id); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [booting, onExit]);

  const execute = () => {
    const input = command.trim();
    if (!input) return;
    const nextHistory = [input, ...history.filter((item) => item !== input)].slice(0, 30);
    setHistory(nextHistory); localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    const result = runOperatorCommand(input, { records, setChannel, setSelectedId, setQuery, exit: onExit });
    setConsoleLines((current) => result.clear ? [] : [...current, `> ${input}`, ...result.lines].slice(-80));
    setCommand(''); setHistoryIndex(-1);
  };

  const handleCommandKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') { event.preventDefault(); execute(); }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const index = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(index); if (index >= 0) setCommand(history[index]);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const index = historyIndex - 1; setHistoryIndex(index); setCommand(index >= 0 ? history[index] : '');
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const matches = OPERATOR_COMMANDS.filter(({ name }) => name.startsWith(command.toLowerCase()));
      if (matches.length === 1) setCommand(matches[0].name + (matches[0].usage.includes('<') ? ' ' : ''));
    }
  };

  if (booting) {
    return (
      <div className="operator-root operator-boot" role="status" aria-live="polite" aria-label="Operator system starting">
        <pre>{BOOT_LINES.slice(0, bootCount).join('\n')}<span className="operator-cursor" aria-hidden="true">█</span></pre>
      </div>
    );
  }

  return (
    <div className="operator-root" aria-label="DC4 field terminal">
      <a href="#operator-workspace" className="operator-skip">Skip to workspace</a>
      <div className="operator-noise" aria-hidden="true" />
      <header className="operator-status">
        <strong>DC4 // FIELD TERMINAL</strong><span>SESSION {enteredAt.toISOString().slice(11, 19)}</span>
        <span className="operator-clock">UTC {formatUtc(clock)}</span><span>NET CONTROLLED</span><span>MODE LOCAL</span>
      </header>

      <div className="operator-grid">
        <nav className="operator-channels" aria-label="Operator channels">
          <p className="operator-panel-label">01 / CHANNELS</p>
          <div className="operator-channel-list">
            {OPERATOR_CHANNELS.map((item) => (
              <button key={item.id} type="button" onClick={() => setChannel(item.id)} aria-current={channel === item.id ? 'page' : undefined}>
                <span>[{item.key}]</span> {item.label}
              </button>
            ))}
          </div>
          <div className="operator-smallreadout">
            <p>ARCHIVE / {records.length.toString().padStart(3, '0')}</p><p>SOURCES / {new Set(records.map((r) => r.domain)).size.toString().padStart(3, '0')}</p>
            <p>LOCAL NOTES / {notes ? '01' : '00'}</p><p className="operator-ok">SYSTEM NOMINAL</p>
          </div>
        </nav>

        <main id="operator-workspace" className="operator-workspace" tabIndex={-1}>
          <div className="operator-workspace-head">
            <div><p className="operator-panel-label">02 / WORKSPACE</p><h1>{channel.toUpperCase()}</h1></div>
            <label className="operator-filter">FILTER <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ALL RECORDS" /></label>
          </div>
          <Workspace channel={channel} records={filtered} selectedId={selected?.id} setSelectedId={setSelectedId} notes={notes} setNotes={setNotes} loading={loading} />
        </main>

        <aside className="operator-inspector" aria-label="Record inspector">
          <p className="operator-panel-label">03 / INSPECTOR</p>
          {selected ? <Inspector record={selected} records={records} onSelect={setSelectedId} /> : <p className="operator-empty">NO RECORD SELECTED</p>}
        </aside>
      </div>

      <section className="operator-console" aria-label="Command console">
        <div className="operator-console-log" aria-live="polite">
          {consoleLines.map((line, index) => <div key={`${index}-${line}`}>{line || '\u00a0'}</div>)}
        </div>
        <label className="operator-command"><span>&gt;</span><input ref={commandRef} value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={handleCommandKey} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Operator command" /><i className="operator-cursor" aria-hidden="true">█</i></label>
        <div className="operator-console-hint">[/] FOCUS CONSOLE &nbsp; [ALT+1–6] CHANNEL &nbsp; [TAB] COMPLETE &nbsp; [ESC] EXIT</div>
      </section>
    </div>
  );
}

interface WorkspaceProps {
  channel: OperatorChannel; records: OperatorRecord[]; selectedId?: string; setSelectedId: (id: string) => void;
  notes: string; setNotes: (value: string) => void; loading: boolean;
}

function Workspace({ channel, records, selectedId, setSelectedId, notes, setNotes, loading }: WorkspaceProps) {
  if (channel === 'notes') return <div className="operator-notes"><label htmlFor="operator-notes">LOCAL OBSERVATIONS // AUTO-SAVED ON THIS DEVICE</label><textarea id="operator-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Enter locally stored observations..." /></div>;
  if (channel === 'sources') {
    const sources = Array.from(new Map(records.map((record) => [record.domain, record])).values());
    return <div className="operator-source-grid">{sources.map((record) => <button key={record.domain} onClick={() => setSelectedId(record.id)}><strong>{record.source}</strong><span>{record.domain}</span><small>{records.filter((r) => r.domain === record.domain).length} RECORD(S) / PUBLIC</small></button>)}</div>;
  }
  if (channel === 'signals') return <div className="operator-signal-board"><div><strong>FEED STATE</strong><span>{loading ? 'SYNCHRONIZING' : 'STABLE'}</span></div><div><strong>PUBLIC SOURCES</strong><span>{new Set(records.map((r) => r.domain)).size} INDEXED</span></div><div><strong>LOCAL CORRELATION</strong><span>AVAILABLE</span></div><p>Signals are locally derived from the public DC4 news feed. No remote shell, private system, or privileged source is connected.</p></div>;
  if (channel === 'timeline') {
    return <ol className="operator-timeline">{[...records].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).map((record) => <li key={record.id}><time>{formatUtc(new Date(record.timestamp))}</time><button onClick={() => setSelectedId(record.id)}>{record.article.title}</button></li>)}</ol>;
  }
  return <div className="operator-records" role="list" aria-label={`${channel} records`}>{records.length ? records.map((record, index) => <button role="listitem" key={record.id} onClick={() => setSelectedId(record.id)} className={cn(selectedId === record.id && 'is-selected')}><span className="operator-record-index">{String(index + 1).padStart(2, '0')}</span><span className="operator-record-main"><small>{record.id} / {record.category.toUpperCase()} / {record.source}</small><strong>{record.article.title}</strong><em>{record.article.description}</em></span><time>{new Date(record.timestamp).toISOString().slice(5, 16).replace('T', ' / ')}</time></button>) : <p className="operator-empty">{loading ? 'SYNCHRONIZING LOCAL FEED...' : 'NO RECORDS MATCH FILTER'}</p>}</div>;
}

function Inspector({ record, records, onSelect }: { record: OperatorRecord; records: OperatorRecord[]; onSelect: (id: string) => void }) {
  return <div className="operator-inspector-body"><p className="operator-record-id">{record.id}</p><h2>{record.article.title}</h2><dl><dt>SOURCE</dt><dd>{record.source}</dd><dt>TIMESTAMP</dt><dd>{formatUtc(new Date(record.timestamp))}</dd><dt>CATEGORY</dt><dd>{record.category}</dd><dt>DOMAIN</dt><dd>{record.domain}</dd><dt>DERIVATION</dt><dd>PUBLIC FEED / LOCAL INDEX</dd><dt>TEXT WORDS</dt><dd>{record.wordCount}</dd></dl><p className="operator-section-label">SUMMARY</p><p className="operator-summary">{record.article.description || 'No local summary available.'}</p><p className="operator-section-label">RELATED ITEMS</p><div className="operator-related">{record.relatedIds.length ? record.relatedIds.map((id) => <button key={id} onClick={() => onSelect(id)}>{id} / {records.find((r) => r.id === id)?.article.title}</button>) : <span>NO LOCAL CORRELATIONS</span>}</div><a href={record.article.url} target="_blank" rel="noreferrer">OPEN PUBLIC SOURCE ↗</a></div>;
}
