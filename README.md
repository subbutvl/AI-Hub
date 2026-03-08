<div align="center">

# 🚀 AI Hub

**The Premium Centralized Workspace for AI Development, Curation, and Automation.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite_WASM-003B57?style=flat&logo=sqlite&logoColor=white)](https://sql.js.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)

</div>

---

## 🌟 Overview

**AI Hub** is a premium, fully client-side developer workspace designed to streamline the lifecycle of AI projects. Whether you are searching for the latest LLM repositories, curating educational YouTube content, reading RSS feeds, or building complex AI skill pipelines, AI Hub provides a unified, high-performance interface to manage it all — with **zero backend required**.

All data is stored locally in your browser using **SQLite WebAssembly** (via `sql.js`) persisted in **IndexedDB** — meaning your data is private, portable, and works completely offline after the initial load.

---

## 🛠️ Key Features

### 📊 Mission Control Dashboard
- **Real-time Stats**: Instant counters for your repositories, web resources, podcasts, AI skills, and use cases.
- **Dynamic Summaries**: Rotating AI-focused mission statements to keep you engaged.
- **Angular Stack Builder Banner**: Prominent feature spotlight for quick access when enabled.
- **Recent Activity**: Quick-access widgets for latest repositories and Web Hub highlights.

### 📂 My Repos — Repository Manager
- **GitHub Integration**: Add any public GitHub repository by URL and auto-fetch its metadata (stars, forks, description, language, topics).
- **Categorization & Tagging**: Organize with custom categories and multi-tag filtering.
- **Featured Pinning**: Tag any repo as `featured` — it always floats to the top of the list regardless of the active sort order.
- **File Explorer**: Browse the full repository file tree directly in the app with search.
- **File Preview**: Renders **Markdown** (`.md`) files with syntax highlighting and GitHub-style prose. Also detects and renders **HTML** files and HTML content in a sandboxed iframe.
- **Dual View**: Switch between a card grid and a paginated table view.
- **Import / Export**: Full CSV round-trip for your entire repository collection.

### 🌐 Web Hub — Smart Content Curation
- **Intelligent Type Detection**: Auto-categorizes links as YouTube videos, channels, playlists, GitHub repos, RSS feeds, podcasts, or generic webpages.
- **Sub-sections**:
  - **Resources** — Bookmark and organize web links with tags and categories.
  - **Featured** — Curated editor picks, toggleable from Settings.
  - **RSS Feeds** — Subscribe to any RSS/Atom feed. Uses a two-stage proxy chain (rss2json → allorigins fallback) to handle feeds that require special headers.
  - **Podcasts** — Track your favorite AI podcasts.
- **Card & Table Views**: Discovery-first card grid or dense management table.
- **Import / Export**: Full CSV portability.

### ⚡ Skill Hub & Use Cases
- **Skill Creator**: Build custom prompted skills with versioning and language support.
- **Skill Library**: Browse, search, and test all your saved skills.
- **Pipeline Builder**: Chain multiple skills into automated multi-step workflows.
- **Use Cases**: Ready-to-use templates for Code Reviews, Security Analysis, Content Summarization, and more.
- **Test Bench**: Run skills interactively with live Gemini AI responses.

### 🏗️ Angular Stack Builder *(Toggleable)*
A 3-step visual wizard to generate a production-ready Angular project scaffold:
- Choose your **UI Framework** (Angular Material, PrimeNG, NgRx, etc.)
- Configure **Tooling** (ESLint, Prettier, Husky, etc.)
- Add **AI Hub integrations** and generate a downloadable zip.

### 📡 RSS Feeds *(Toggleable)*
- Subscribe to any public RSS or Atom feed.
- Two-stage proxy: `rss2json.com` → `allorigins.win` with native `DOMParser` fallback.
- Full article list with publication dates, authors, and inline descriptions.

### 🎙️ Podcasts *(Toggleable)*
- Track and organize AI podcast subscriptions.
- Podcast-aware link type detection in Web Hub.

---

## 🗄️ Data Storage Architecture

AI Hub uses a **fully client-side SQLite database** — no backend, no cloud sync, no accounts.

| Layer | Technology | Purpose |
|---|---|---|
| Database Engine | `sql.js` (SQLite WASM) | Full SQL database in the browser |
| ORM | `drizzle-orm` | Type-safe queries & schema migrations |
| Persistence | `localforage` (IndexedDB) | Survives page refreshes |
| State Management | `zustand` | Reactive UI state on top of the DB |

**Each user has their own isolated local database.** Data never leaves the browser.

> **Note:** Because storage is per-browser, different users on different machines will have independent datasets. No centralized data sync is currently implemented.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **npm** or **yarn**

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ai-hub.git
cd ai-hub

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create a .env file in the root:
echo "GEMINI_API_KEY=your_key_here" > .env

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
```

The `dist/` folder contains a fully static site that can be hosted on any CDN (GitHub Pages, Vercel, Netlify, etc.).

---

## 🏗️ Project Structure

```text
ai-hub/
├── src/
│   ├── components/         # Reusable UI components (shadcn/ui + custom)
│   │   ├── DatabaseProvider.tsx  # WASM DB init & loading gate
│   │   ├── Layout.tsx            # Sticky nav with all feature toggles
│   │   ├── MarkdownViewer.tsx    # MD + HTML preview renderer
│   │   ├── FileTree.tsx          # Repo file explorer
│   │   └── ...
│   ├── db/
│   │   ├── index.ts        # sql.js init, localforage persistence
│   │   └── schema.ts       # Drizzle ORM table definitions
│   ├── hooks/              # Zustand stores (DB-backed)
│   │   ├── useRepoStore.ts
│   │   ├── useWebHubStore.ts
│   │   ├── useSkillStore.ts
│   │   ├── useRssStore.ts
│   │   ├── usePodcastStore.ts
│   │   ├── useFeaturedStore.ts
│   │   └── useSettings.ts
│   ├── pages/              # Route-level page components
│   │   ├── Dashboard.tsx
│   │   ├── MyRepos.tsx
│   │   ├── RepoDetail.tsx
│   │   ├── WebHub.tsx
│   │   ├── Featured.tsx
│   │   ├── RssFeeds.tsx
│   │   ├── Podcasts.tsx
│   │   ├── Settings.tsx
│   │   ├── Help.tsx
│   │   └── skills/         # Skill Hub sub-pages
│   ├── services/           # GitHub API & external integrations
│   ├── types/              # TypeScript interfaces & domain types
│   ├── utils/              # CSV helpers, formatters
│   └── data/               # Sample data CSV files
├── public/
│   └── sql-wasm.wasm       # SQLite WebAssembly binary (served statically)
└── vite.config.ts
```

---

## ⚙️ Settings & Feature Toggles

All features are toggled from the **Settings** page. Disabled sections are hidden from the navigation automatically.

| Setting | Controls |
|---|---|
| Web Hub | Web Hub section & nav item |
| RSS Feeds | RSS Feeds sub-section |
| Podcasts | Podcasts sub-section |
| Repo Hub | Repo Hub dropdown nav |
| Skill Hub | Skill Hub dropdown nav |
| Angular Stack Builder | Stack Builder nav link & Dashboard banner |
| Featured Section | Featured curated content tab |

---

## 🗺️ Roadmap

- [ ] **AI Skill Marketplace** — Discover and share skills with the community.
- [ ] **Team Collaboration** — Shared repositories and approval workflows.
- [ ] **Advanced Analytics** — Performance tracking and cost analysis for AI execution.
- [ ] **Visual Workflow Builder** — Drag-and-drop interface for complex skill composition.
- [ ] **Data Migration Tool** — Import existing localStorage data into the SQLite database.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
Built with ❤️ for the AI Developer Community.
</div>
