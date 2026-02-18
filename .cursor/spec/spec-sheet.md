1. What This App Does
Glasswork shows who’s actually contributing in group projects by analyzing Google Docs edits and GitHub repo activity. It turns raw revisions and commits into an easy, “Spotify Wrapped for group work” report with a hacker-terminal vibe.

2. Core Features
- Doc Analyzer: Sign in with Google via NextAuth, paste a Docs URL, and we fetch revisions from Google Drive/Docs APIs to group edits by user, build daily timelines, and compute Fair Share Scores. Results render as ranked contributor cards with mini heatmaps and a shareable link.
- Repo Analyzer: Enter owner/repo, then we call GitHub’s /stats/contributors (with polling on 202) and /contributors for avatars to compute weighted contributions and weekly activity. Contributors are ranked with badges, heatmaps, and Fair Share Scores, with one-click copy-to-clipboard sharing.
- Contribution Playback: Replay a project’s history (daily Docs edits or weekly GitHub commits) with scrubbable controls and contributor spotlights using Framer Motion. Users can add simple annotations and export snapshots for sharing.

3. Tech Stack
- Framework: Next.js 14 (App Router, TypeScript)
- UI: Tailwind CSS, shadcn/ui, Framer Motion
- Auth: NextAuth.js (Google OAuth with drive.readonly, documents.readonly; access_token stored in JWT + session)
- Database: None initially (client-side state via React Context/Zustand); optional Convex for saving analyses and shareable URLs
- APIs/Providers: Google Drive Revisions + Docs API; GitHub REST API (/stats/contributors, /contributors)

4. UI Design Style
Dark-mode-only cyberpunk terminal aesthetic on #020617 with neon cyan (#22d3ee) and fuchsia (#e879f9) accents, soft glow effects, and subtle motion throughout.