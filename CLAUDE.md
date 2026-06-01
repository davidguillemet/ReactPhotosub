# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (React, CRA-based)
```bash
npm start                # Dev server at http://localhost:3000
npm test                 # Jest test runner
npm run build            # Production build
npm run build4Firebase   # Build for Firebase Hosting (outputs to functions/web/)
npm run firebase         # Run Firebase emulators (hosting on 5002, functions on 5003)
```

### Backend (Cloud Functions)
```bash
cd functions
npm run lint             # ESLint
npm run serve            # Firebase functions emulator
npm run deploy           # Deploy to Firebase
```

## Architecture

### Frontend (`src/`)

**Module resolution:** `jsconfig.json` sets `baseUrl: "src"`, so all imports are relative to `src/`. E.g., `import Foo from 'components/foo'` resolves to `src/components/foo`.

**App shell (`src/template/`):** The top-level layout is `appContent.js` — it renders the `Header`, a collapsible sidebar `Drawer` (mini permanent on desktop, swipeable temporary on mobile), the main `PageContent` outlet, and a `Footer`. The home page hides the permanent sidebar.

**Routing (`src/navigation/routes.js`):** React Router v7 with lazy loading. Each route entry specifies a `page` string that maps to `pages/<page>` via dynamic import inside `lazyLoader`. Pages export `Component`, an optional `loaderFactory(queryClient, dataProvider, firebaseProvider)`, and optional `actionProperties`. Routes marked `private: true` require auth; `admin: true` requires the admin role.

**Data fetching:** Two-layer pattern:
1. `DataProvider` (`src/dataProvider/dataprovider.js`) — thin Axios wrapper exposing typed methods (`getDestinations`, `getDestinationProps`, etc.). Array params are serialized with `qs.stringify(..., { arrayFormat: 'repeat' })`.
2. TanStack Query (`@tanstack/react-query`) for caching, used inside page `loaderFactory` functions and component hooks.

**Providers (nested in `src/App.js`):** From outer to inner — `FirebaseProvider` → `TranslationProvider` → `ReactQueryClientProvider` → `AuthProvider` → `DataManagerProvider` → `OverlayProvider` → `ToastContextProvider` → `AppContent`. Adding a new global context means inserting it in this chain.

**Theming (`src/template/theme/`):** Two MUI themes — `deepOceanTheme` (dark, default) and `lightTheme`. Both expose a custom `theme.pageWidth` token (`{ width, maxWidth }`) used by `fixedWidthComponent` in the router to constrain non-fullWidth pages.

**i18n (`src/utils/`):** `useTranslation(namespace)` returns a `t(key)` function. Translation files live in `public/translations/{fr,en}.json`. Keys are namespaced (e.g., `"menu"`, `"routes"`, `"pages.home"`).

**Animations:** GSAP 3 with `useGSAP` hook. Use `contextSafe` for event-handler animations. Animate only CSS properties that don't mix `left`/`right` in a single tween sequence.

**New components:** Place reusable components under `src/components/<name>/`, with `<name>.js` and an `index.js` that re-exports the default. Import via the alias `components/<name>`.

### Backend (`functions/`)

**Entry point:** `functions/index.js` exports two Cloud Functions: `mainapi` (Express app for `/api/**`) and `preRender` (SSR for hosting rewrites).

**API structure (`functions/api/`):**
- `expressApi.js` — mounts resource routers under `/api`
- `resources/` — one file per domain (destinations, destination, images, search, favorites, portfolio, …)
- `middlewares/` — `isAuthenticated` (verifies Firebase JWT), `isAuthorized(roles)`, `isAdmin`
- `utils/` — DB helpers, image conversion utilities

**Database:** PostgreSQL via `knex` (pool initialized in `functions/utils/`). No ORM — queries are written with the knex query builder.

**Storage:** Google Cloud Storage for images. Image processing uses `sharp` (resize/format) and `exifr` (EXIF extraction), triggered by Cloud Function storage triggers in `functions/triggers/`.

**Authentication flow:** Client obtains a Firebase ID token → sends it as `Authorization: Bearer <token>` → `isAuthenticated` middleware verifies via `admin.auth().verifyIdToken()` → custom claims carry the `roles` array checked by `isAuthorized`.

### Firebase

Emulator ports: Functions 5003 · Hosting 5002 · Auth 9099 · Storage 9199.

`firebase.json` rewrites: `/api/**` → `mainapi`, everything else → `preRender` (SSR).

Build for deployment: `npm run build4Firebase` (frontend), then deploy via `firebase deploy` or `cd functions && npm run deploy`.
