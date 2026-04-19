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
        subtitle="Last updated: April 18, 2026"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-8 text-sm text-brand-text-secondary leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Who We Are</h2>
            <p>
              This Privacy Policy for Humor Index Media LLC (doing business as The Humor Index) (&quot;<strong>we</strong>,&quot;
              &quot;<strong>us</strong>,&quot; &quot;<strong>our</strong>&quot;) describes how and why we might collect, store,
              use, and/or share (&quot;<strong>process</strong>&quot;) your information when you use our services
              (&quot;<strong>Services</strong>&quot;), such as when you visit our website at{' '}
              <a href="https://thehumorindex.com" className="text-brand-gold hover:underline">https://thehumorindex.com</a>.
              Humor Index Media LLC is registered in Florida, United States, at 4932 Native Dancer Ln, Orlando, FL 32826.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Data We Collect</h2>
            <p className="mb-2">
              The Humor Index is a read-only analytics site. We do not offer user accounts, and we do not collect personal
              information directly from you through forms, sign-ups, or registrations on this site. We do, however, collect
              certain technical information automatically when you visit:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                <strong className="text-brand-text-primary">Log &amp; usage data:</strong> Our hosting provider (Vercel) logs
                service-related, diagnostic, usage, and performance information including your IP address, browser type and
                settings, and information about your activity on the site (such as timestamps of requests and pages viewed).
                IP addresses are a personal identifier under certain laws.
              </li>
              <li>
                <strong className="text-brand-text-primary">Device data:</strong> Information about your device such as browser,
                operating system, language preferences, and hardware identifiers gathered through standard HTTP request
                headers.
              </li>
              <li>
                <strong className="text-brand-text-primary">Cookies:</strong> The site may set essential and analytics cookies
                through <strong className="text-brand-text-primary">Vercel Analytics</strong> and{' '}
                <strong className="text-brand-text-primary">Google Analytics 4</strong>. Google Analytics uses cookies to
                collect aggregated information about how visitors use the Site (for example, pages visited, time on page, and
                referral sources). We have enabled IP anonymization. We do not use advertising or cross-site tracking cookies.
                You can opt out of Google Analytics by installing the{' '}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
                  Google Analytics Opt-out Browser Add-on
                </a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">How We Use Your Information</h2>
            <p className="mb-2">We process the information described above to:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Deliver and maintain the website (render pages, serve static assets);</li>
              <li>Identify usage trends and improve the Services;</li>
              <li>Protect the Services from abuse, fraud, or security incidents;</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p className="mt-2">
              Under the EU/UK GDPR, our lawful bases for processing are <em>legitimate interests</em> (to understand usage
              trends and protect the Services) and, where applicable, <em>legal obligation</em>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">We Do Not Sell Your Data</h2>
            <p>
              We do not sell, rent, or trade your personal information. We do not share information for targeted advertising
              or cross-context behavioral advertising.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Third Parties We Share Data With</h2>
            <p className="mb-2">
              We disclose information only to third-party service providers that help us operate the Site, including:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong className="text-brand-text-primary">Website Hosting Service Providers</strong> (Vercel) — to host the Site and serve requests;</li>
              <li><strong className="text-brand-text-primary">Cloud Computing Services</strong> — for storage and delivery of static assets;</li>
              <li><strong className="text-brand-text-primary">Data Analytics Services</strong> (Google Analytics, Vercel Analytics) — to measure aggregated usage and improve the Site. Google Analytics is operated by Google LLC with data processed in the United States; see Google&apos;s{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">Privacy Policy</a>.
              </li>
            </ul>
            <p className="mt-2">
              We may also disclose information when legally required, in connection with a business transfer, or to protect
              our rights and users.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">International Transfers</h2>
            <p>
              The Services are hosted in the United States. If you access the Services from the European Economic Area, the
              United Kingdom, Switzerland, or another region, your information may be transferred to, stored, and processed
              in the United States. Where required, we rely on the European Commission&apos;s Standard Contractual Clauses
              with our service providers to protect such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Data Retention</h2>
            <p>
              We retain technical log and usage data only as long as necessary for the purposes described above, and in any
              case no longer than 12 months, unless a longer retention period is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Security</h2>
            <p>
              We have implemented appropriate and reasonable technical and organizational security measures designed to
              protect the information we process. However, no electronic transmission or storage is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Your Privacy Rights</h2>
            <p className="mb-2">
              Depending on where you live, you may have the right to:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Request access to the personal information we hold about you;</li>
              <li>Request correction or deletion of your personal information;</li>
              <li>Object to or restrict our processing of your personal information;</li>
              <li>Withdraw consent where processing is based on consent;</li>
              <li>Lodge a complaint with your local data protection authority.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:privacy@thehumorindex.com" className="text-brand-gold hover:underline">
                privacy@thehumorindex.com
              </a>
              . Your request will be honored where the applicable country&apos;s privacy law grants you the right to access.
              California and other US state residents: please see the section below.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Notice to US Residents</h2>
            <p className="mb-2">
              This policy covers all currently enacted US state privacy laws (including CCPA/CPRA in California, VCDPA in
              Virginia, CPA in Colorado, CTDPA in Connecticut, UCPA in Utah, FDBR in Florida, TDPSA in Texas, and equivalents
              in Oregon, Montana, Iowa, Indiana, Tennessee, Delaware, New Hampshire, New Jersey, Kentucky, Maryland, Minnesota,
              Rhode Island, and Nebraska). Subject to the applicable law, you may have the right to:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Know what personal information is collected and why;</li>
              <li>Access, correct, or delete your personal information;</li>
              <li>Opt out of the sale or sharing of personal information (we do not sell or share);</li>
              <li>Limit the use of sensitive personal information (we do not collect sensitive information);</li>
              <li>Appeal a denial of a privacy rights request.</li>
            </ul>
            <p className="mt-2">
              To submit a request, email{' '}
              <a href="mailto:privacy@thehumorindex.com" className="text-brand-gold hover:underline">
                privacy@thehumorindex.com
              </a>{' '}
              or mail Humor Index Media LLC, 4932 Native Dancer Ln, Orlando, FL 32826.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Children&apos;s Privacy</h2>
            <p>
              The Services are not directed to children under 18. We do not knowingly collect personal information from
              children. If you believe a child has provided us with personal information, please contact us and we will delete
              it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The updated version will be indicated by an updated
              &quot;Last updated&quot; date at the top of this page. We encourage you to review this Privacy Policy periodically
              to stay informed.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Contact</h2>
            <p className="mb-2">
              If you have questions or comments about this notice, you may email us at{' '}
              <a href="mailto:privacy@thehumorindex.com" className="text-brand-gold hover:underline">
                privacy@thehumorindex.com
              </a>{' '}
              or write to us at:
            </p>
            <p className="mb-1"><strong className="text-brand-text-primary">Humor Index Media LLC</strong></p>
            <p className="mb-1">4932 Native Dancer Ln</p>
            <p className="mb-1">Orlando, FL 32826</p>
            <p>United States</p>
          </section>
        </div>
      </div>
    </div>
  );
}
