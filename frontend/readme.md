# Lead Manager – Frontend

React + Vite frontend for the Lead Management assignment. It implements httpOnly JWT auth, AG Grid for the Leads list, server-side pagination and filters, and a smooth white/blue UI. Ready for local dev and Vercel deployment.

## Features

- Auth: register, login, logout, get current user (`/auth/me`) using httpOnly JWT cookies
- Leads: list, create, edit, delete
- Pagination + filters (server-side): status, source, email contains, score range, created_at range, qualified
- AG Grid for the list view (v34, Community modules registered app-wide)
- Render cold-start handling: “Waking up backend…” banner and retry
- Clean, minimal UI with Tailwind CSS (v4, via `@tailwindcss/vite`)

## Tech stack

- React 19 + Vite 7
- React Router 6
- Tailwind CSS 4 (with `@tailwindcss/vite`)
- AG Grid Community 34 (`ag-grid-community`, `ag-grid-react`)

## Prerequisites

- Node.js LTS/Current: 20.19+ or 22.12+ (Vite requirement). If you’re on Node 22.7, upgrade to 22.12+ to remove warnings.
- A running backend (default <http://localhost:4000>). Set the URL via env (see below).

## Quick start

1. Configure env

Copy `.env.example` to `.env.local` and set your backend URL:

```env
VITE_API_URL=http://localhost:4000
```

1. Install deps

```bash
npm install
```

1. Run dev server

```bash
npm run dev
```

Vite will open on 5173 (or the next free port like 5174/5175). Login with the seeded account:

- Email: `test@erino.io`
- Password: `Test@1234`

## Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview the built app locally
- `npm run lint` – lint with ESLint

## Environment

- `VITE_API_URL` – Base URL for the backend (e.g., `http://localhost:4000` or your Render URL)

## Project structure (key files)

- `src/App.jsx` – routing, layout, protected routes
- `src/auth/AuthContext.jsx` – auth state, cold-start handling, login/register/logout
- `src/lib/api.js` – fetch helper (`credentials: 'include'` for httpOnly cookies)
- `src/lib/agGrid.js` – AG Grid module registration (v34 requirement)
- `src/pages/LeadsPage.jsx` – AG Grid list, filters, pagination
- `src/pages/LeadFormPage.jsx` – create/edit lead form
- `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`
- `src/components/ui/*` – small UI primitives (Button, Input, Select, Card, etc.)

## AG Grid notes

- v34 requires registering Community modules once. We do this in `src/lib/agGrid.js` and import it in `src/main.jsx`.
- The grid uses the legacy CSS theme with:
- CSS: `import 'ag-grid-community/styles/ag-grid.css'` and `import 'ag-grid-community/styles/ag-theme-alpine.css'`
- Prop: `theme="legacy"` on `<AgGridReact />`
- The grid is wrapped in a fixed-height container to avoid layout issues.

## Filters supported (mapped to backend)

- `status_equals`, `source_equals`
- `email_contains`
- `score_between=min,max`
- `created_at_between=YYYY-MM-DD,YYYY-MM-DD`
- `is_qualified_equals=true|false`

## Deployment (Vercel)

1. Push this folder to a repo; import in Vercel as a Vite app.
1. Set Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`.
1. Build command: `npm run build`, Output: `dist` (default Vite settings work).

## Render cold start

If your backend sleeps on Render free tier, the UI shows a banner and retries health checks for ~30s before retrying requests.

## Troubleshooting

- Vite Node warning: “You are using Node.js 22.7.0 … Vite requires 20.19+ or 22.12+”
- Upgrade Node to 22.12+ (or use 20.19+). The dev server may still run, but upgrading removes the warning.

- AG Grid error #272 (modules not registered)
- Ensure `src/lib/agGrid.js` exists and is imported in `src/main.jsx`.

- AG Grid error #239 (Theming API vs CSS theme conflict)
- We set `theme="legacy"` on the grid. Keep CSS imports as-is (`ag-grid.css`, `ag-theme-alpine.css`).

- Cookies/CORS in dev
- Backend allows any origin in development (so 5173/5174/5175 work). In production it uses `FRONTEND_URL`.
- Ensure `VITE_API_URL` matches your backend URL.

- Backend sleeping on Render
- The app shows “Waking up backend…” and retries automatically. Wait ~30s.

## License

For assignment/demo purpose.
