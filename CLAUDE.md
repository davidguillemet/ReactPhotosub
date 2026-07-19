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

**Form framework (`src/components/form/` + `src/dialogs/`):** Declarative forms with two building blocks:

1. `Form` (import from `components/form`) — renders fields defined as an array of field descriptors. Each field object shape:
   ```js
   {
     id: "fieldName",        // maps to the submitted values key
     label: "Label",
     type: FIELD_TYPE_TEXT,  // FIELD_TYPE_TEXT | NUMBER | DATE | SELECT | SWITCH | CHECK_BOX | TAGS_FIELD | LATLONG | URL | EMAIL | PASSWORD | HIDDEN
     required: true,
     errorText: "...",
     default: "",
     focus: true,            // autofocus
     multiLingual: true,     // duplicate field into FR and EN tabs
     languageSuffix: false,  // controls ID generation for multiLingual fields:
                             //   false (default): FR keeps original id, EN gets `${id}_en`
                             //   true: both get suffix → `${id}_fr` and `${id}_en`
     group: "groupName",     // group consecutive fields with same group into language tabs
     lang: "fr",             // required when group is set manually; drives the tab label suffix
     multiline: false,       // text fields only
     options: () => [],      // select fields: function returning options array
   }
   ```
   Import field type constants alongside `Form`: `import Form, { FIELD_TYPE_TEXT, FIELD_TYPE_SELECT, ... } from 'components/form'`.
   Key `Form` props: `fields`, `initialValues`, `submitAction(values)`, `onCancel`, `submitCaption`, `validationMessage`, `onChange`, `readOnly`.

2. `useFormDialog` + `FormDialog` (import from `dialogs/FormDialog`) — wraps a `Form` in a MUI dialog:
   ```js
   const { dialogProps, openDialog, FormDialog } = useFormDialog(onClose);
   // render:
   <FormDialog title="..." {...dialogProps} maxWidth="sm">
     <MyForm />   // FormDialog injects onCancel → closes dialog
   </FormDialog>
   ```
   `FormDialog` injects `onCancel` into its child via `cloneElement`. To auto-close after a successful submit, call `onCancel()` at the end of `submitAction`.

**Confirmation dialog (`src/dialogs/ConfirmDialog.js`):** Generic confirm/cancel dialog. Props: `open`, `title`, `dialogContent` (string array — each entry becomes a paragraph), `onOpenChanged(bool)`, `onValidate`, `onCancel`. The dialog closes before calling `onValidate`, so the handler runs after the dialog is already gone.
```js
<ConfirmDialog
  open={!!target}
  title={target?.name}
  dialogContent={[t("confirm:delete", target?.name)]}
  onOpenChanged={(open) => { if (!open) setTarget(null); }}
  onValidate={() => target && doDelete(target.id)}
/>
```

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

## Database Schema

Full DDL: `localhost-2026-07-14_191934-dump.sql` (PostgreSQL 15, pg_dump 18.4).

### Tables

**`destinations`**
| column | type | notes |
|---|---|---|
| `id` | smallint PK | auto-generated |
| `path` | text | `"year/location"` e.g. `"2024/halmahera"` — unique index |
| `title` | text | French title |
| `title_en` | text | English title |
| `date` | date | travel date |
| `location` | smallint FK→locations.id | |
| `cover` | text | cover image filename |
| `macro` | boolean | has macro photos |
| `wide` | boolean | has wide-angle photos |
| `published` | boolean | default true |
| `tags` | text[] | |

**`images`**
| column | type | notes |
|---|---|---|
| `id` | integer PK | auto-generated |
| `name` | text | filename |
| `path` | text | `"year/location"` — unique with `name` |
| `title` | text | |
| `description` | text | species description (parsed by `parseSingleDescription`) |
| `tags` | text[] | searchable tags |
| `captionTags` | text[] | |
| `caption` | text | |
| `width` / `height` | smallint | |
| `sizeRatio` | double | width/height |
| `create` | timestamp | |
| `sub_gallery_id` | integer FK→sub_galleries.id | nullable |
| `portfolio` | boolean | |
| `excluded_cats` | text[] | portfolio categories where image is excluded |
| `version` | text | default `"1"`, used for ImageKit cache busting (`?v=`) |
| `search_text` | text | maintained by trigger `trg_images_search_text`; accent-folded lowercase concat of title+description+tags |

**`locations`**
| column | type | notes |
|---|---|---|
| `id` | smallint PK | |
| `title` | text | |
| `latitude` / `longitude` | real | |
| `link` | text | external link |
| `region` | smallint FK→regions.id | |

**`regions`**
| column | type | notes |
|---|---|---|
| `id` | smallint PK | |
| `title` | text | French |
| `title_en` | text | English |
| `parent` | smallint FK→regions.id | self-referential tree |

**`sub_galleries`**
| column | type | notes |
|---|---|---|
| `id` | integer PK | |
| `destination_id` | smallint FK→destinations.id | CASCADE DELETE |
| `title` / `title_en` | text | |
| `desc` / `desc_en` | text | |
| `index` | smallint | display order |
| `location` | smallint FK→locations.id | nullable |

**`portfolioCategories`**
| column | type | notes |
|---|---|---|
| `id` | smallint PK | |
| `key` | text | unique |
| `caption_fr` / `caption_en` | text | |

**`user_data`**
| column | type | notes |
|---|---|---|
| `uid` | text PK | Firebase UID |
| `favorites` | text[] | array of image paths |
| `simulations` | jsonb | |

### View

**`destinations_with_regionpath`** — joins `destinations` + `locations` + `images` (for the cover image's `version`). Adds `cover_version` and `regionpath` (recursive array of `{id, title, title_en, parent}` objects walking up the region tree).

### Functions & Triggers

- `f_unaccent(text)` — IMMUTABLE plpgsql wrapper around `unaccent()`, used at query time for accent-insensitive search.
- `trg_images_search_text()` — BEFORE INSERT OR UPDATE OF `title, description, tags` on `images`; populates `search_text` with lowercased, accent-folded concatenation of those three fields.
