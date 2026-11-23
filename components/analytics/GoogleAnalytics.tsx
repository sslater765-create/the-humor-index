import Script from 'next/script';

const GA_ID = 'G-5Z6ZJKMCGM';

export default function GoogleAnalytics() {
  // Only load GA in production
  if (process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          // Automated browsers (navigator.webdriver, HeadlessChrome) get no gtag,
          // so crawler page views and events never reach GA.
          if (!navigator.webdriver && !/HeadlessChrome|PhantomJS|Puppeteer|Playwright/i.test(navigator.userAgent)) {
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){window.dataLayer.push(arguments);};
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            page_path: window.location.pathname,
          });
          }
        `}
      </Script>
    </>
  );
}
