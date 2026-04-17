import { useEffect, useState } from 'react';

interface GlitchOverlayProps {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}

const GLYPHS = '▓▒░█▌▐│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬01░▒▓◢◣◤◥◆';

const randomLine = (length: number) =>
  Array.from({ length }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('');

export const GlitchOverlay = ({ active, duration = 1400, onComplete }: GlitchOverlayProps) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setLines(Array.from({ length: 14 }, () => randomLine(60)));
    }, 60);

    const timer = setTimeout(() => {
      clearInterval(interval);
      onComplete?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [active, duration, onComplete]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
      role="presentation"
      aria-hidden="true"
    >
      {/* Black flash base */}
      <div className="absolute inset-0 bg-black animate-fade-in" style={{ animationDuration: '120ms' }} />

      {/* RGB split bars */}
      <div className="absolute inset-0 mix-blend-screen opacity-80">
        <div
          className="absolute inset-0"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent 0 2px, hsl(0 100% 50% / 0.15) 2px 3px, transparent 3px 5px, hsl(180 100% 50% / 0.12) 5px 6px)',
          }}
        />
      </div>

      {/* Scanline sweep */}
      <div
        className="absolute left-0 right-0 h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent"
        style={{ animation: 'glitch-sweep 1.4s ease-in-out forwards' }}
      />

      {/* Glyph rain */}
      <pre className="relative font-mono text-[10px] sm:text-xs leading-tight text-green-400/80 whitespace-pre select-none drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]">
        {lines.join('\n')}
      </pre>

      {/* Center cipher */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div
            className="text-red-500 font-mono text-2xl sm:text-4xl font-black tracking-[0.4em] mix-blend-difference"
            style={{ animation: 'glitch-shake 0.08s steps(2) infinite' }}
          >
            // SIGNAL ACQUIRED
          </div>
          <div className="mt-2 text-cyan-300 font-mono text-xs sm:text-sm tracking-widest opacity-80">
            decrypting channel…
          </div>
        </div>
      </div>

      <style>{`
        @keyframes glitch-sweep {
          0% { top: -10%; opacity: 0; }
          20% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        @keyframes glitch-shake {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-2px, 1px); }
          50% { transform: translate(2px, -1px); }
          75% { transform: translate(-1px, -2px); }
          100% { transform: translate(1px, 2px); }
        }
      `}</style>
    </div>
  );
};
