# Glasswork

**See through the work.** Glasswork analyzes Google Docs and GitHub repositories to reveal who actually contributed, using a fair-share scoring model.

## Features

- **Google Docs Analysis** -- parses revision history to measure per-contributor effort
- **GitHub Repo Analysis** -- examines commit stats, additions/deletions, and co-author tags
- **Fair Share Scoring** -- 100 = fair share, >100 = overcontributor, <100 = undercontributor (capped at 200)
- **Contributor Tiers** -- carry (top 25%), solid (middle 50%), ghost (bottom 25%)
- **AI Summaries** -- Claude-powered analysis summaries and rubric-based feedback
- **Report Chat** -- conversational AI assistant for deeper analysis insights
- **Contribution Receipts** -- exportable PNG receipts showing team contributions

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Backend | Convex (serverless DB + functions) |
| Auth | @convex-dev/auth (Google OAuth) |
| Styling | Tailwind CSS, shadcn/ui |
| Animation | Framer Motion |
| AI | Anthropic Claude |
| Testing | Vitest, React Testing Library |
| CI | GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Convex](https://convex.dev) account
- Google OAuth credentials (for Docs analysis)
- Anthropic API key (for AI features)

### Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

3. Start the Convex dev server:

```bash
npx convex dev
```

4. In a separate terminal, start the Next.js dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
src/
  app/              Next.js App Router pages
    api/            API routes (report-chat, rubric-feedback)
    app/            Authenticated app shell and dashboard
    results/[id]/   Analysis results page
  components/       React components
    ui/             shadcn/ui primitives
    ReportChat/     AI chat panel
  hooks/            Custom React hooks
  lib/              Utilities, types, formatters
convex/             Convex backend
  schema.ts         Database schema
  analyses.ts       Analysis queries and mutations
  scoring.ts        Fair share scoring algorithm
  analyzeGoogleDoc.ts   Google Docs analysis pipeline
  analyzeGitHubRepo.ts  GitHub repo analysis pipeline
  generateSummary.ts    AI summary generation
```

## License

Private -- all rights reserved.
