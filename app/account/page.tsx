import { pageMeta } from '@/lib/seo';
import AccountSettings from '@/components/auth/AccountSettings';

export const metadata = pageMeta({
  title: 'Account — The Humor Index',
  description: 'Manage your Humor Index account.',
  path: '/account',
});

export default function AccountPage() {
  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif italic text-3xl text-brand-text-primary mb-8">Account</h1>
      <AccountSettings />
    </main>
  );
}
