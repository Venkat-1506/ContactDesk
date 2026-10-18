# People Atlas (ContactDesk)

A personal relationship CRM — track your close circle, family, classmates, and professional network in a beautiful editorial-style interface.

## Features

- **Landing page** with animated network preview (`/`)
- **Dual workspaces** — Personal (empty by default) and Demo (auto-seeded sample network), fully isolated in localStorage
- **Insights** — live SVG donut/bar charts for groups, places, relationships, and network balance
- **People / Places / Recent / Favorites** views with search, filters, and activity journal
- **Contact forms** with phone/URL validation, merge-or-replace JSON import, JSON export
- **Demo mode banner** with reset/exit controls
- **Responsive** — fixed top navbar, mobile bottom navigation, scroll-to-top button
- **Accessible** — keyboard navigation, `prefers-reduced-motion` support throughout

## Tech Stack

React 19 · React Router 7 · Vite 8 · Vanilla CSS · Vitest

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm test           # vitest (33 tests)
npm run lint       # oxlint
```

## Deployment (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects handled via `public/_redirects`

## Project Structure

```
src/
├── components/    # Navbar, Logo, Icon, ContactForm, ScrollToTopButton, charts, modals
├── pages/         # Landing, AppWorkspace, DemoEntry, Atlas, People, Places, Recent, Favorites, Data, Add/Edit/Details
├── styles/        # components.css, Landing.css
└── utils/         # contactStorage (workspace-aware), insightCalculations
```
