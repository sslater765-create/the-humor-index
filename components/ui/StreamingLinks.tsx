const STREAMING_DATA: Record<string, { platform: string; url: string; label: string }[]> = {
  'the-office': [
    { platform: 'Peacock', url: 'https://www.peacocktv.com/watch/asset/tv/the-office/8629940', label: 'Watch on Peacock' },
  ],
  'seinfeld': [
    { platform: 'Netflix', url: 'https://www.netflix.com/title/70153373', label: 'Watch on Netflix' },
  ],
  '30-rock': [
    { platform: 'Peacock', url: 'https://www.peacocktv.com/watch/asset/tv/30-rock/5829929', label: 'Watch on Peacock' },
  ],
  'friends': [
    { platform: 'Max', url: 'https://www.max.com/shows/friends/9b4e42a4-8491-4f01-8dd1-56a09c4f0069', label: 'Watch on Max' },
  ],
  'arrested-development': [
    { platform: 'Netflix', url: 'https://www.netflix.com/title/70140358', label: 'Watch on Netflix' },
  ],
  'parks-and-recreation': [
    { platform: 'Peacock', url: 'https://www.peacocktv.com/watch/asset/tv/parks-and-recreation/6587534', label: 'Watch on Peacock' },
  ],
  'brooklyn-nine-nine': [
    { platform: 'Peacock', url: 'https://www.peacocktv.com/watch/asset/tv/brooklyn-nine-nine/5836386', label: 'Watch on Peacock' },
  ],
  'schitts-creek': [
    { platform: 'Netflix', url: 'https://www.netflix.com/title/80036165', label: 'Watch on Netflix' },
  ],
  'big-bang-theory': [
    { platform: 'Max', url: 'https://www.max.com/shows/the-big-bang-theory/4a30bfc3-2839-4731-912e-e77e1e89cdc3', label: 'Watch on Max' },
  ],
  'its-always-sunny': [
    { platform: 'Hulu', url: 'https://www.hulu.com/series/its-always-sunny-in-philadelphia-4bda387b-2a2a-4273-9cef-a1c7a498f1ab', label: 'Watch on Hulu' },
  ],
  'two-and-a-half-men': [
    { platform: 'Peacock', url: 'https://www.peacocktv.com/watch/asset/tv/two-and-a-half-men/5312185', label: 'Watch on Peacock' },
  ],
};

interface Props {
  showSlug: string;
  episodeLabel?: string;
}

export default function StreamingLinks({ showSlug, episodeLabel }: Props) {
  const links = STREAMING_DATA[showSlug];
  if (!links || links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(link => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center gap-1.5 text-xs border border-brand-border rounded-lg px-3 py-2.5 text-brand-text-muted hover:text-brand-gold hover:border-brand-gold transition-colors active:scale-95"
        >
          {link.label}
          {episodeLabel && <span className="text-brand-text-muted">· {episodeLabel}</span>}
          <span className="opacity-50">↗</span>
        </a>
      ))}
    </div>
  );
}
