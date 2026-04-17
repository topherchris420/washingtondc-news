export type CovcomAction =
  | { type: 'none' }
  | { type: 'redirect'; destination: string; channel: string }
  | { type: 'open-contact'; channel: string };

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
      type: 'redirect',
      destination: 'https://github.com/topherchris420/james_library',
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
