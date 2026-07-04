import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | ultFMT",
  description: "Privacy Policy for ultFMT — AI developer tools.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "July 4, 2026";

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: {lastUpdated}</p>
      </div>

      <div className="prose prose-slate max-w-none text-slate-700 space-y-10">

        <section>
          <p className="text-base leading-relaxed">
            This Privacy Policy explains how <strong>ultFMT</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;,
            &ldquo;us&rdquo;) handles information when you use our tools at <strong>ultfmt.com</strong> (or
            any subdomain). We have built ultFMT with privacy as a core principle — not an afterthought.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">1. The Short Version</h2>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <p className="text-emerald-900 text-sm">We do <strong>not</strong> store any files or data you submit to our tools.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <p className="text-emerald-900 text-sm">We do <strong>not</strong> require accounts, logins, or any personal information.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <p className="text-emerald-900 text-sm">We do <strong>not</strong> collect or store your API keys.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <p className="text-emerald-900 text-sm">We do <strong>not</strong> sell or share your data with third parties.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <p className="text-emerald-900 text-sm">We use only basic server logs for uptime monitoring (no content, no IP tracking beyond what your ISP and Render.com infrastructure logs).</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">2. What Information We Collect</h2>
          <h3 className="text-base font-semibold text-slate-700 mb-2">2a. Information you submit to tools</h3>
          <p className="leading-relaxed">
            When you use any ultFMT tool (e.g. uploading a CSV for Dataset Health or Feature Intelligence,
            pasting a prompt into the Token Estimator), the content is transmitted to our server solely to
            compute a result and return it to you.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4">
            <p className="font-semibold text-slate-800 mb-2">What happens to your data on the server:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 text-sm">
              <li>Your data is received by the server and loaded into <strong>RAM only</strong>.</li>
              <li>The requested computation (analysis, diff, token count, etc.) is performed.</li>
              <li>The result is sent back to your browser.</li>
              <li>The data is garbage-collected from memory. <strong>No copy is written to disk or any database.</strong></li>
            </ol>
          </div>
          <p className="mt-4 leading-relaxed text-sm text-slate-600">
            <strong>Client-side tools:</strong> Some tools (e.g. the Learning Curve Plotter, Prompt Diff,
            JSON Formatter) operate entirely in your browser and never send any data to our servers at all.
          </p>

          <h3 className="text-base font-semibold text-slate-700 mt-6 mb-2">2b. Server logs</h3>
          <p className="leading-relaxed">
            Our hosting provider (Render.com) automatically records basic HTTP request logs, which may include:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
            <li>Request timestamp</li>
            <li>HTTP method and URL path (e.g. <code className="bg-slate-100 px-1 rounded text-xs">POST /api/v1/tools/dataset-health</code>)</li>
            <li>HTTP status code</li>
            <li>Response size</li>
            <li>Your IP address (standard web server behaviour)</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            These logs <strong>do not contain the content of your requests</strong> (i.e. your files or text are
            not logged). Logs are retained by Render.com per their own retention policy, over which we have
            limited control. We do not access these logs except to diagnose server errors.
          </p>

          <h3 className="text-base font-semibold text-slate-700 mt-6 mb-2">2c. Local browser storage</h3>
          <p className="leading-relaxed">
            ultFMT stores your <strong>UI preferences</strong> (e.g. font size, tab size, word wrap settings)
            in your browser&apos;s <code className="bg-slate-100 px-1 rounded text-xs">localStorage</code> under
            the key <code className="bg-slate-100 px-1 rounded text-xs">ultfmt_settings</code>. This data
            never leaves your device and is not transmitted to us. You can clear it at any time by
            clearing your browser&apos;s site data for this domain.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">3. What We Do Not Collect</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>Names, email addresses, or any personally identifiable information</li>
            <li>API keys for any AI provider (OpenAI, Anthropic, Google, etc.)</li>
            <li>Payment information of any kind</li>
            <li>Cross-site tracking data (other than standard ad network cookies)</li>
            <li>The content of files, prompts, or datasets submitted to tools</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">4. Third-Party Services</h2>
          <p className="leading-relaxed">
            ultFMT uses the following infrastructure providers:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-slate-600">
            <li>
              <strong>Render.com</strong> — Hosts our backend API server. Render may collect
              infrastructure-level data as described in their{" "}
              <a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Privacy Policy
              </a>.
            </li>
            <li>
              <strong>Vercel / hosting provider</strong> — Hosts the frontend. May collect access logs per
              their standard data handling policies.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">5. Advertising & Cookies</h2>
          <p className="leading-relaxed">
            We use third-party advertising companies, such as <strong>Google AdSense</strong>, to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-slate-600">
            <li>Third party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to your website or other websites.</li>
            <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ads Settings</a>. (Alternatively, you can direct users to opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">www.aboutads.info</a>).</li>
          </ul>
          <p className="mt-4 leading-relaxed">
            By using this site, you consent to the use of such cookies and the sharing of data captured by such cookies with Google and other third-party partners.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">6. Sensitive Data Warning</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="font-semibold text-amber-900 mb-2">⚠ Please be cautious</p>
            <p className="text-amber-800 text-sm leading-relaxed">
              While we do not store your data, your files and text transit our servers over HTTPS.
              We strongly advise <strong>against</strong> uploading datasets or entering text that contains:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-amber-700 text-sm">
              <li>Personal health information (PHI) or medical records</li>
              <li>Financial records or payment card data</li>
              <li>Government-issued ID numbers</li>
              <li>Confidential business trade secrets</li>
              <li>Credentials, API keys, or passwords</li>
            </ul>
            <p className="text-amber-800 text-sm mt-3">
              If you must test with sensitive data, consider anonymizing or masking it first.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">7. Children&apos;s Privacy</h2>
          <p className="leading-relaxed">
            ultFMT is intended for developers and technical users. We do not knowingly collect any
            information from children under the age of 13. If you believe a child has submitted
            personal information through our Service, please contact us via GitHub.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">8. Security</h2>
          <p className="leading-relaxed">
            All communication between your browser and our servers is encrypted via HTTPS/TLS. Our
            backend implements input validation, file size limits, and filetype whitelisting to protect
            against common web vulnerabilities. However, no method of transmission over the internet
            is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">9. Changes to This Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be reflected on this
            page with an updated &ldquo;Last updated&rdquo; date. We encourage you to review this page
            periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-3">10. Contact</h2>
          <p className="leading-relaxed">
            If you have any questions or concerns about this Privacy Policy, please open an issue on
            our{" "}
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
        <Link href="/terms-of-service" className="hover:text-slate-800">Terms of Service →</Link>
      </div>
    </div>
  );
}
