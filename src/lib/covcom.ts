export type CovcomAction =
  | { type: 'none' }
  | { type: 'redirect'; destination: string; channel: string; glitch?: boolean }
  | { type: 'open-contact'; channel: string }
  | { type: 'open-operator'; channel: 'library-access' };

export interface CovcomChannel {
  id: string;
  aliases: string[];
  resolve: () => CovcomAction;
}

const normalizeSignal = (value: string) => value.trim().toLowerCase();

const channels: CovcomChannel[] = [
  {
    id: 'library-access',
    aliases: ['137', 'library'],
    resolve: () => ({
      type: 'open-operator',
      channel: 'library-access',
    }),
  },
  {
    id: 'travel-dossier',
    aliases: ['401', 'travel', 'passage'],
    resolve: () => ({
      type: 'redirect',
      destination: '/hidden/travel.pdf',
      channel: 'travel-dossier',
    }),
  },
  {
    id: 'archive-dossier',
    aliases: ['1776', 'archive', 'dossier'],
    resolve: () => ({
      type: 'redirect',
      destination: '/hidden/dossier.pdf',
      channel: 'archive-dossier',
    }),
  },
  {
    id: 'cipher-transmission',
    aliases: ['2087', 'cipher', 'transmission'],
    resolve: () => ({
      type: 'redirect',
      destination: 'https://github.com/topherchris420/james_library',
      channel: 'cipher-transmission',
      glitch: true,
    }),
  },
  {
    id: 'contact-channel',
    aliases: ['contact', 'signal'],
    resolve: () => ({ type: 'open-contact', channel: 'contact-channel' }),
  },
];

export const resolveCovcomSignal = (input: string): CovcomAction => {
  const normalizedSignal = normalizeSignal(input);

  if (!normalizedSignal) {
    return { type: 'none' };
  }

  const channel = channels.find((entry) => entry.aliases.includes(normalizedSignal));
  return channel ? channel.resolve() : { type: 'none' };
};

export const COVCOM_CHANNELS = channels;
