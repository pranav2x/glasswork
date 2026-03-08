import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Glasswork",
  description: "How Glasswork handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-warm-200/40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Glasswork" className="h-6 w-6 rounded-lg object-contain" />
            <span className="font-myflora text-[15px] font-medium text-warm-800">Glasswork</span>
          </Link>
          <Link
            href="/"
            className="font-body text-[13px] text-warm-500 transition-colors hover:text-warm-800"
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-myflora text-[3rem] leading-[1.1] tracking-tight text-warm-900">
          Privacy Policy
        </h1>
        <p className="mt-4 font-body text-[14px] text-warm-400">Last updated: March 2025</p>

        <div className="mt-12 space-y-10 font-body text-[15px] leading-relaxed text-warm-600">

          <section>
            <h2 className="font-myflora text-[1.5rem] text-warm-900">What is Glasswork?</h2>
            <p className="mt-3">
              Glasswork (<strong>glasswork.me</strong>) is a contribution analysis tool that helps
              teams understand who contributed to a GitHub repository or Google Doc. We surface
              commit history, edit history, and individual contribution scores so group work is
              transparent.
            </p>
          </section>

          <section>
            <h2 className="font-myflora text-[1.5rem] text-warm-900">Information we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Google account information</strong> — when you sign in with Google, we
                receive your name, email address, and profile picture from Google OAuth. We use
                this solely to identify your account.
              </li>
              <li>
                <strong>GitHub repository data</strong> — when you submit a public GitHub repo,
                we fetch publicly available commit history and contributor metadata via the
                GitHub API.
              </li>
              <li>
                <strong>Google Docs revision history</strong> — when you submit a Google Doc
                link, we fetch the document&apos;s revision history using your Google OAuth
                permissions to calculate per-contributor word counts.
              </li>
              <li>
                <strong>Analysis results</strong> — contribution scores and summaries generated
                from the above data are stored so you can revisit them.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-myflora text-[1.5rem] text-warm-900">How we use your information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>To authenticate you and associate analyses with your account.</li>
              <li>To compute and display contribution scores for repos and docs you submit.</li>
              <li>To generate AI-powered summaries of contribution patterns using the Claude API.</li>
              <li>We do <strong>not</strong> sell your data to third parties.</li>
              <li>We do <strong>not</strong> use your data for advertising.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-myflora text-[1.5rem] text-warm-900">Third-party services</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Google OAuth</strong> — used for sign-in. Governed by{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-warm-900"
                >
                  Google&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>GitHub API</strong> — used to fetch public repository data. Governed by{" "}
                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-warm-900"
                >
                  GitHub&apos;s Privacy Statement
                </a>
                .
              </li>
              <li>
                <strong>Anthropic Claude API</strong> — used to generate AI summaries. Data sent to
                Claude is governed by{" "}
                <a
                  href="https://www.anthropic.com/policies/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-warm-900"
                >
                  Anthropic&apos;s Terms of Service
                </a>
                .
              </li>
              <li>
                <strong>Convex</strong> — our backend database provider. Data is stored securely
                on Convex infrastructure.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-myflora text-[1.5rem] text-warm-900">Data retention</h2>
            <p className="mt-3">
              Your account data and analysis results are retained as long as your account is
              active. You can request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="font-myflora text-[1.5rem] text-warm-900">Your rights</h2>
            <p className="mt-3">
              You may request access to, correction of, or deletion of your personal data at any
              time. To do so, email us at the address below.
            </p>
          </section>

          <section>
            <h2 className="font-myflora text-[1.5rem] text-warm-900">Contact</h2>
            <p className="mt-3">
              Questions about this policy? Reach out at{" "}
              <a
                href="mailto:rapellipranav1@gmail.com"
                className="underline underline-offset-2 hover:text-warm-900"
              >
                rapellipranav1@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-warm-200 bg-[#F9F7F4] px-6 py-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Glasswork" className="h-5 w-5 rounded-lg object-contain opacity-50" />
            <span className="font-myflora text-[14px] text-warm-400">Glasswork</span>
          </div>
          <p className="text-[12px] text-warm-400">© 2025 Glasswork</p>
        </div>
      </footer>
    </div>
  );
}
