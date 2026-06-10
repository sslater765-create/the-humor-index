import { pageMeta, breadcrumbJsonLd } from '@/lib/seo';
import SignInForm from '@/components/auth/SignInForm';

export const metadata = pageMeta({
  title: 'Sign in — The Humor Index',
  description:
    'Sign in to save your taste profile, ratings, and blind-test streak across devices. No passwords — magic link or Google.',
  path: '/signin',
});

export default function SignInPage() {
  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Sign in', path: '/signin' },
            ]),
          ),
        }}
      />

      <header className="mb-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold mb-2">Your Index</p>
        <h1 className="font-serif italic text-3xl text-brand-text-primary mb-3">Sign in</h1>
        <p className="text-sm text-brand-text-secondary leading-relaxed">
          Keep your taste profile, ratings, and streak in sync wherever you watch.
        </p>
      </header>

      <SignInForm />
    </main>
  );
}
