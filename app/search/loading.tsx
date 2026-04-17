import PageHeader from '@/components/layout/PageHeader';

export default function SearchLoading() {
  return (
    <div>
      <PageHeader
        label="Search"
        title="Search Every Joke"
        subtitle="Indexing thousands of analyzed jokes across every show…"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div
          className="w-full h-12 bg-brand-surface border border-brand-border rounded-xl animate-pulse mb-4"
          aria-hidden="true"
        />
        <div className="flex gap-2 mb-6">
          <div className="w-24 h-8 bg-brand-surface border border-brand-border rounded-lg animate-pulse" aria-hidden="true" />
          <div className="w-32 h-8 bg-brand-surface border border-brand-border rounded-lg animate-pulse" aria-hidden="true" />
        </div>
        <div className="space-y-3" role="status" aria-label="Loading search results">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-brand-card border border-brand-border rounded-xl p-4 animate-pulse"
              aria-hidden="true"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 w-48 bg-brand-surface rounded" />
                <div className="h-3 w-20 bg-brand-surface rounded" />
              </div>
              <div className="h-4 w-full bg-brand-surface rounded mb-2" />
              <div className="h-4 w-3/4 bg-brand-surface rounded" />
            </div>
          ))}
          <span className="sr-only">Loading jokes, please wait…</span>
        </div>
      </div>
    </div>
  );
}
