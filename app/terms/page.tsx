import PageHeader from '@/components/layout/PageHeader';

export const metadata = {
  title: 'Terms of Use — The Humor Index',
  description: 'Terms of Use for The Humor Index website.',
  alternates: {
    canonical: 'https://thehumorindex.com/terms',
  },
};

export const dynamic = 'force-static';

export default function TermsPage() {
  return (
    <div>
      <PageHeader
        label="Legal"
        title="Terms of Use"
        subtitle="Last updated: April 18, 2026"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-8 text-sm text-brand-text-secondary leading-relaxed">
          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Agreement to Our Legal Terms</h2>
            <p className="mb-2">
              We are Humor Index Media LLC, doing business as The Humor Index
              (&quot;<strong>Company</strong>,&quot; &quot;<strong>we</strong>,&quot; &quot;<strong>us</strong>,&quot; &quot;<strong>our</strong>&quot;), a
              company registered in Florida, United States, at 4932 Native Dancer Ln, Orlando, FL 32826.
            </p>
            <p className="mb-2">
              We operate the website{' '}
              <a href="https://thehumorindex.com" className="text-brand-gold hover:underline">
                https://thehumorindex.com
              </a>{' '}
              (the &quot;<strong>Site</strong>&quot;), as well as any other related products and services that refer or link
              to these legal terms (the &quot;<strong>Legal Terms</strong>&quot;) (collectively, the
              &quot;<strong>Services</strong>&quot;).
            </p>
            <p className="mb-2">
              The Humor Index is a comedy analytics platform that uses AI to score and rank sitcom episodes by joke density,
              craft, and impact. We provide quantitative humor ratings, leaderboards, and analysis for TV comedy shows so that
              fans, critics, and writers can compare episodes, explore rankings, and read editorial commentary on comedy craft.
            </p>
            <p className="mb-2">
              You can contact us by email at{' '}
              <a href="mailto:legal@thehumorindex.com" className="text-brand-gold hover:underline">
                legal@thehumorindex.com
              </a>{' '}
              or by mail to 4932 Native Dancer Ln, Orlando, FL 32826, United States.
            </p>
            <p>
              These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of
              an entity (&quot;<strong>you</strong>&quot;), and Humor Index Media LLC, concerning your access to and use of the
              Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of
              these Legal Terms. <strong>IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED
              FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Intellectual Property Rights</h2>
            <p className="mb-2">
              We are the owner or the licensee of all intellectual property rights in our Services, including all source code,
              databases, functionality, software, website designs, audio, video, text, photographs, graphics, and the
              methodology, scoring algorithms, and original written analysis (&quot;Our Content&quot;), as well as the
              trademarks, service marks, and logos contained therein (&quot;Our Marks&quot;).
            </p>
            <p className="mb-2">
              Our Content and Our Marks are protected by copyright and trademark laws. Our Content and Our Marks are provided
              in or through the Services &quot;AS IS&quot; for your personal, non-commercial use only.
            </p>
            <p>
              Show names, episode titles, character names, and transcript references are the property of their respective
              copyright holders and are used on this Site for the purpose of commentary, criticism, and analysis. Episode
              ratings displayed on the Site are sourced from IMDb. Show metadata is sourced from TMDB.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">User Representations</h2>
            <p className="mb-2">By using the Services, you represent and warrant that:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>You have the legal capacity and you agree to comply with these Legal Terms;</li>
              <li>You are not a minor in the jurisdiction in which you reside, and in any event you are at least 18 years of age;</li>
              <li>You will not access the Services through automated or non-human means, whether through a bot, script, scraper, or otherwise, except as expressly permitted by us in writing;</li>
              <li>You will not use the Services for any illegal or unauthorized purpose; and</li>
              <li>Your use of the Services will not violate any applicable law or regulation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Prohibited Activities</h2>
            <p className="mb-2">
              You may not access or use the Services for any purpose other than that for which we make the Services available.
              As a user of the Services, you agree not to:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us;</li>
              <li>Use the Services to advertise or offer to sell goods and services;</li>
              <li>Sell or otherwise transfer your profile (if any);</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the Services;</li>
              <li>Engage in unauthorized framing of or linking to the Services;</li>
              <li>Make improper use of our support services or submit false reports of abuse or misconduct;</li>
              <li>Engage in any automated use of the system, such as using scripts to send messages, or use any data mining, robots, or similar data gathering and extraction tools;</li>
              <li>Attempt to impersonate another user or person, or use the username of another user;</li>
              <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services;</li>
              <li>Copy or adapt the Services&apos; software;</li>
              <li>Decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services;</li>
              <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Third-Party Websites and Content</h2>
            <p>
              The Services may contain links to other websites (&quot;<strong>Third-Party Websites</strong>&quot;) as well as
              articles, photographs, text, graphics, and other content belonging to or originating from third parties
              (&quot;<strong>Third-Party Content</strong>&quot;). Such Third-Party Websites and Third-Party Content are not
              investigated, monitored, or checked for accuracy or completeness by us, and we are not responsible for any
              Third-Party Websites accessed through the Services or any Third-Party Content. Inclusion of, linking to, or
              permitting the use of any Third-Party Websites or Third-Party Content does not imply approval or endorsement
              thereof by us.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Services Management</h2>
            <p>
              We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms;
              (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal
              Terms, including without limitation, reporting such user to law enforcement authorities; (3) refuse, restrict
              access to, limit the availability of, or disable (to the extent technologically feasible) any of your
              contributions or any portion thereof; and (4) otherwise manage the Services in a manner designed to protect
              our rights and property and to facilitate the proper functioning of the Services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Privacy Policy</h2>
            <p>
              We care about data privacy and security. Please review our{' '}
              <a href="/privacy" className="text-brand-gold hover:underline">
                Privacy Policy
              </a>
              . By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal
              Terms. The Services are hosted in the United States. If you access the Services from any other region of the
              world with laws or other requirements governing personal data collection, use, or disclosure that differ from
              applicable laws in the United States, then through your continued use of the Services, you are transferring
              your data to the United States, and you agree to have your data transferred to and processed in the United
              States.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Term and Termination</h2>
            <p>
              These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER
              PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY,
              DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON
              OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED
              IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Modifications and Interruptions</h2>
            <p className="mb-2">
              We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at
              our sole discretion without notice. We also reserve the right to modify or discontinue all or part of the
              Services without notice at any time.
            </p>
            <p>
              We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other
              problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors.
              We will not be liable for any loss, damage, or inconvenience caused by your inability to access or use the
              Services during any downtime or discontinuance of the Services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Governing Law</h2>
            <p>
              These Legal Terms and your use of the Services are governed by and construed in accordance with the laws of the
              State of Florida applicable to agreements made and to be entirely performed within the State of Florida, without
              regard to its conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Dispute Resolution</h2>
            <h3 className="text-sm font-medium text-brand-text-primary mt-3 mb-2">Informal Negotiations</h3>
            <p className="mb-2">
              To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms
              (each a &quot;<strong>Dispute</strong>&quot;), the Parties agree to first attempt to negotiate any Dispute
              informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon
              written notice from one Party to the other Party.
            </p>

            <h3 className="text-sm font-medium text-brand-text-primary mt-4 mb-2">Binding Arbitration</h3>
            <p className="mb-2">
              If the Parties are unable to resolve a Dispute through informal negotiations, the Dispute (except those Disputes
              expressly excluded below) will be finally and exclusively resolved by binding arbitration. The arbitration shall
              be commenced and conducted under the Commercial Arbitration Rules of the American Arbitration Association
              (&quot;AAA&quot;). The arbitration shall take place in Orange County, Florida. The parties agree that the
              arbitrator shall have the authority to award reasonable attorneys&apos; fees and costs. If the arbitrator
              determines the fees assessed in connection with the arbitration are excessive, we will pay all such fees.
              Except where otherwise required by the applicable AAA rules or applicable law, the arbitration will take place
              in Orange County, Florida, United States.
            </p>

            <h3 className="text-sm font-medium text-brand-text-primary mt-4 mb-2">Restrictions</h3>
            <p className="mb-2">
              The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the
              full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no
              right or authority for any Dispute to be arbitrated on a class-action basis or to utilize class action
              procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative
              capacity on behalf of the general public or any other persons.
            </p>

            <h3 className="text-sm font-medium text-brand-text-primary mt-4 mb-2">Exceptions to Informal Negotiations and Arbitration</h3>
            <p>
              The Parties agree that the following Disputes are not subject to the above provisions concerning informal
              negotiations and binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity
              of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations
              of theft, piracy, invasion of privacy, or unauthorized use; and (c) any claim for injunctive relief. Any such
              Dispute shall be resolved by a court of competent jurisdiction located in Orange County, Florida, and the
              Parties agree to submit to the personal jurisdiction of that court.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Corrections</h2>
            <p>
              There may be information on the Services that contains typographical errors, inaccuracies, or omissions,
              including descriptions, show metadata, scoring outputs, and various other information. We reserve the right to
              correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any
              time, without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Disclaimer</h2>
            <p>
              THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT
              YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN
              CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS
              ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES&apos; CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THE
              SERVICES. Our AI-generated humor scores, rankings, and analysis represent algorithmic assessments, not objective
              truths. Comedy is subjective, and our scores are one data-driven perspective among many.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Limitation of Liability</h2>
            <p>
              IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT,
              INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST
              REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF
              THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU
              FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO ONE HUNDRED
              U.S. DOLLARS (USD $100.00). CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED
              WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE
              ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our
              respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or
              demand, including reasonable attorneys&apos; fees and expenses, made by any third party due to or arising out
              of: (1) your use of the Services; (2) breach of these Legal Terms; (3) any breach of your representations and
              warranties set forth in these Legal Terms; (4) your violation of the rights of a third party, including but not
              limited to intellectual property rights; or (5) any overt harmful act toward any other user of the Services
              with whom you connected via the Services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Electronic Communications, Transactions, and Signatures</h2>
            <p>
              Visiting the Services and sending us emails constitutes electronic communications. You consent to receive
              electronic communications, and you agree that all agreements, notices, disclosures, and other communications we
              provide to you electronically, via email and on the Services, satisfy any legal requirement that such
              communication be in writing.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">California Users and Residents</h2>
            <p>
              If any complaint with us is not satisfactorily resolved, you can contact the Complaint Assistance Unit of the
              Division of Consumer Services of the California Department of Consumer Affairs in writing at 1625 North Market
              Blvd., Suite N 112, Sacramento, California 95834 or by telephone at (800) 952-5210 or (916) 445-1254.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Miscellaneous</h2>
            <p>
              These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the
              Services constitute the entire agreement and understanding between you and us. Our failure to exercise or
              enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision.
              If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or
              unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not
              affect the validity and enforceability of any remaining provisions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-medium text-brand-text-primary mb-3">Contact Us</h2>
            <p className="mb-2">
              In order to resolve a complaint regarding the Services or to receive further information regarding use of the
              Services, please contact us at:
            </p>
            <p className="mb-1"><strong className="text-brand-text-primary">Humor Index Media LLC</strong></p>
            <p className="mb-1">4932 Native Dancer Ln</p>
            <p className="mb-1">Orlando, FL 32826</p>
            <p className="mb-1">United States</p>
            <p>
              <a href="mailto:legal@thehumorindex.com" className="text-brand-gold hover:underline">
                legal@thehumorindex.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
