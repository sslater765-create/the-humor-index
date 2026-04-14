import PageHeader from '@/components/layout/PageHeader';

export const metadata = {
  title: 'Privacy Policy — The Humor Index',
  description: 'How The Humor Index collects, uses, and protects your data.',
  alternates: {
    canonical: 'https://thehumorindex.com/privacy',
  },
};

export const dynamic = 'force-static';

export default function PrivacyPage() {
  return (
    <div>
      <PageHeader
        label="Legal"
        title="Privacy Policy"
        subtitle="Last updated: April 14, 2026"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-8 text-sm text-brand-text-secondary leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Data We Collect</h2>
            <p className="mb-2">
              The Humor Index collects minimal data to operate the site and improve your experience:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong className="text-brand-text-primary">Analytics:</strong> We use Vercel Analytics to collect anonymous usage data such as page views, referrer URLs, and device type. No personally identifiable information is collected through analytics.</li>
              <li><strong className="text-brand-text-primary">Newsletter:</strong> If you subscribe to our newsletter, your email address is collected and managed through Beehiiv. Your email is used solely for sending our weekly newsletter.</li>
              <li><strong className="text-brand-text-primary">Advertising:</strong> If Google AdSense is enabled, Google may collect data through cookies to serve personalized ads. You can opt out of personalized advertising at Google Ad Settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">How We Use Your Data</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>To send you our weekly newsletter (if subscribed)</li>
              <li>To understand how visitors use the site and improve content</li>
              <li>To serve relevant advertising (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">We Do Not Sell Your Data</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. Your email address is never shared outside of our newsletter provider (Beehiiv).
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Cookies</h2>
            <p className="mb-2">
              The site may use the following cookies:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong className="text-brand-text-primary">Vercel Analytics:</strong> Anonymous performance and usage tracking</li>
              <li><strong className="text-brand-text-primary">Google AdSense:</strong> Advertising cookies (if ads are enabled)</li>
            </ul>
            <p className="mt-2">
              You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Your Rights (GDPR / CCPA)</h2>
            <p className="mb-2">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request deletion of your data</li>
              <li>Opt out of data collection or marketing communications</li>
              <li>Unsubscribe from our newsletter at any time via the link in each email</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Contact</h2>
            <p>
              For privacy-related questions or data requests, contact us at{' '}
              <a href="mailto:hello@thehumorindex.com" className="text-brand-gold hover:underline">
                hello@thehumorindex.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
