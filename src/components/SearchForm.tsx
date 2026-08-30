import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { resolveCovcomSignal } from '@/lib/covcom';

interface SearchFormProps {
  onGlitchTarget: (target: string) => void;
  onOperatorOpen: () => void;
}

export function SearchForm({ onGlitchTarget, onOperatorOpen }: SearchFormProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const action = resolveCovcomSignal(searchValue);

    if (action.type === 'open-operator') {
      onGlitchTarget('operator://library-access');
      return;
    }

    if (action.type === 'redirect') {
      if (action.glitch) {
        onGlitchTarget(action.destination);
        return;
      }
      window.location.href = action.destination;
      return;
    }

    if (action.type === 'open-contact') {
      window.location.href = 'mailto:ciao_chris@proton.me';
    }
  };

  return (
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
  );
}
