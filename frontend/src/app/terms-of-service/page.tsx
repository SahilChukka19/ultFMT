import Link from "next/link";

export const metadata = {
  title: "Terms of Service | ultFMT",
  description: "Terms of Service for ultFMT — AI developer tools.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "July 4, 2026";

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Terms of Service</h1>
        <p className="text-sm text-slate-500">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate max-w-none text-slate-700 space-y-10">

        <section>
          <p className="text-base leading-relaxed">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of <strong>ultFMT</strong>
            (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;), a collection of web-based developer
            tools for AI engineers. By using the Service, you agree to these Terms. If you do not agree,
            please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. Use of the Service</h2>
          <p className="leading-relaxed">
            ultFMT provides a suite of developer utilities including dataset analysis, feature engineering
            tools, token estimators, prompt utilities, and more. You may use the Service for personal,
            academic, or professional purposes. You agree not to:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-slate-600">
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Attempt to reverse-engineer, disassemble, or otherwise tamper with the Service.</li>
            <li>Upload files containing malware, malicious code, or content that infringes on third-party rights.</li>
            <li>Deliberately attempt to overload, crash, or degrade the performance of the Service for other users.</li>
            <li>Scrape, crawl, or systematically extract data from the Service through automated means.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. No Account Required</h2>
          <p className="leading-relaxed">
            ultFMT does not require you to create an account. You do not provide us with any personal
            identifying information to use the tools. There is no login, no registration, and no profile.
            The Service is available to everyone without authentication.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. Data Processing & No Retention</h2>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-4">
            <p className="font-semibold text-indigo-900 mb-1">Our core data commitment:</p>
            <p className="text-indigo-800 text-sm leading-relaxed">
              Any files, datasets, or text you submit to ultFMT are processed <strong>in memory only</strong>,
              solely to compute and return results to you. We do not write your data to disk, store it
              in a database, log its contents, or retain it in any form after your request is fulfilled.
              Your data is discarded immediately upon completion of the operation.
            </p>
          </div>
          <p className="leading-relaxed">
            Specifically:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-slate-600">
            <li>CSV, Excel, or other files uploaded for analysis are loaded into server memory, processed, and then garbage-collected. No copy is kept.</li>
            <li>Text inputs (prompts, code snippets, JSON) are used only to compute the requested output and are not stored.</li>
            <li>We do not collect, store, or transmit your data to any third-party analytics or storage service.</li>
            <li>We do not require, collect, or store any API keys from you.</li>
          </ul>
          <p className="mt-4 leading-relaxed">
            You should still exercise caution and avoid uploading data containing sensitive personal
            information, financial records, or confidential business data unless you are comfortable
            with that data transiting a web server.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Intellectual Property</h2>
          <p className="leading-relaxed">
            The ultFMT name, logo, design, and underlying code are the intellectual property of the
            project maintainer. You may not copy, reproduce, or redistribute the Service or its
            source code without explicit written permission, except as permitted by the open-source
            license governing the project (if any), which can be found in the project repository on GitHub.
          </p>
          <p className="mt-3 leading-relaxed">
            Any data, files, or content you submit to the Service remains entirely yours. We claim
            no ownership or license over your inputs or outputs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. Disclaimer of Warranties</h2>
          <p className="leading-relaxed">
            The Service is provided <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong>,
            without any warranty of any kind, express or implied, including but not limited to warranties
            of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
          <p className="mt-3 leading-relaxed">
            We do not warrant that the results produced by the tools (e.g. correlation scores, token counts,
            health metrics) are accurate, complete, or suitable for production use without independent
            verification. Always validate critical outputs before using them in production systems.
          </p>
          <p className="mt-3 leading-relaxed">
            We do not guarantee uninterrupted or error-free operation of the Service. The Service is
            hosted on a free-tier infrastructure and may be subject to downtime, rate limiting, or
            resource constraints.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">6. Limitation of Liability</h2>
          <p className="leading-relaxed">
            To the maximum extent permitted by applicable law, ultFMT and its maintainer shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages, including
            loss of data, loss of revenue, or loss of profits, arising out of or in connection with
            your use of the Service, even if advised of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">7. Third-Party Services</h2>
          <p className="leading-relaxed">
            The Service may contain links to third-party websites or services (e.g. GitHub). We have
            no control over and assume no responsibility for the content, privacy policies, or practices
            of any third-party sites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">8. Rate Limiting & Fair Use</h2>
          <p className="leading-relaxed">
            To ensure fair access for all users, certain endpoints (particularly those involving
            heavy computation such as machine learning analyses) may be subject to rate limiting.
            Attempts to circumvent rate limits, perform denial-of-service attacks, or otherwise
            abuse the Service are strictly prohibited and may result in your IP being blocked.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">9. Changes to These Terms</h2>
          <p className="leading-relaxed">
            We reserve the right to modify these Terms at any time. Changes will be reflected on this
            page with an updated &ldquo;Last updated&rdquo; date. Continued use of the Service after
            changes are posted constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">10. Contact</h2>
          <p className="leading-relaxed">
            Questions about these Terms? Open an issue or contact us via the{" "}
            <a
              href="https://github.com/SahilChukka19/ultFMT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline font-medium"
            >
              GitHub repository
            </a>.
          </p>
        </section>

      </div>

      <div className="mt-16 pt-8 border-t border-slate-100 flex gap-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-800">← Back to Tools</Link>
        <Link href="/privacy-policy" className="hover:text-slate-800">Privacy Policy →</Link>
      </div>
    </div>
  );
}
