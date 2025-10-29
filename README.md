# Bookmark Manager

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
<!-- - [Screenshots](#screenshots) -->
- [Architecture](#architecture)
<!-- - [Data Model](#data-model)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Seeding (optional)](#seeding-optional)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [PWA](#pwa)
- [Browser Extension](#browser-extension)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [FAQ](#faq) -->
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Demo

- **Live**: _TBD_
- **Figma**: _premium file_

## Features

**User workflows**

- Add bookmarks with **title, description, URL, tags**.
- Auto‑fetch website **metadata** (title/description) and **favicon** from the URL.
- View all bookmarks with **grid/list** layouts and skeleton loading.
- **Search** by title (debounced) and **filter** by multiple tags from a sidebar.
- **Sort** by Recently added / Recently visited / Most visited.
- **Pin**/unpin, **archive**/unarchive without deleting.
- **Visit** links directly, with **visit counts** and **last visited date** tracked.
- **Edit** bookmark details and tags.
- **Copy** bookmark URL to clipboard.
- **Light/Dark** theme toggle.
- Responsive and accessible UI; hover/focus states for all interactive elements.

**Advanced**

- **Auth** with NextAuth (Google OAuth by default).
- **MongoDB** with Mongoose models and useful indexes.
- **Duplicate detection** per user using URL normalization.
- **Cloudinary** storage for avatars and favicons (remote upload).
- **PWA**: installable on mobile, basic offline caching of last results.
- **Chrome/Edge extension**: one‑click save current tab.
- **Keyboard shortcuts** for power users.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) · React · TypeScript
- **Styling**: Tailwind CSS · shadcn/ui · CSS variables
- **State/Data**: Server Components first; client hooks for UI state
- **Auth**: NextAuth + MongoDBAdapter
- **DB**: MongoDB (Atlas or local) · **Mongoose**
- **Scraping**: `fetch` + **cheerio** on server route
- **Images**: **Cloudinary** remote uploads (avatars, favicons)
- **Testing**: Vitest · Testing Library · Playwright (E2E)
- **CI/CD**: Vercel (suggested)

---

<!-- ## Screenshots -->

<!-- > Add screenshots once the UI is in place.

- Home (All bookmarks)
- Add/Edit dialog
- Details drawer
- Archive view
- Mobile layout -->

---

<!-- ## Architecture

```
app/
  layout.tsx
  page.tsx                  # All bookmarks (filters via search params)
  archive/page.tsx          # Archived bookmarks
  settings/page.tsx         # Profile settings (avatar, name)
  api/
    auth/[...nextauth]/route.ts
    bookmarks/route.ts      # GET list, POST create
    bookmarks/[id]/route.ts # GET, PATCH, DELETE
    tags/route.ts           # GET, POST
    tags/[id]/route.ts      # PATCH, DELETE
    scrape/route.ts         # POST { url } → { title, description, favicon }
    visit/[id]/route.ts     # POST increment visitCount + lastVisitedAt
    extension/save/route.ts # POST from browser extension
components/
  layout/
  bookmarks/
  ui/
hooks/
lib/
  auth.ts
  mongodb.ts
  mongodbClientPromise.ts
  normalizeUrl.ts
  validation.ts
  cloudinary.ts
  uploadRemote.ts
models/
  User.ts
  Tag.ts
  Bookmark.ts
public/
  sw.js
  manifest.webmanifest
scripts/
  seed.ts
```

Key ideas:

- Use **URL query params** as the source of truth for search/filters/sort so pages are shareable and SSR/RSC-friendly.
- **Normalized URL** is stored to enforce per‑user uniqueness and detect duplicates.
- Favor **RSC** for data reads; use client components for forms, dialogs, and keyboard navigation.

--- -->

<!-- ## Data Model

```ts
// User
{
  _id: ObjectId,
  name?: string,
  email?: string,
  image?: string,        // Cloudinary avatar
  createdAt, updatedAt
}

// Tag
{
  _id: ObjectId,
  userId: ObjectId,      // → User
  name: string,
  color?: string,        // hex/hsl
  createdAt, updatedAt
}

// Bookmark
{
  _id: ObjectId,
  userId: ObjectId,      // → User
  title: string,
  description?: string,
  url: string,
  normalizedUrl: string, // unique with (userId)
  faviconUrl?: string,   // Cloudinary
  siteName?: string,
  isPinned: boolean,
  isArchived: boolean,
  visitCount: number,
  lastVisitedAt?: Date,
  tags: ObjectId[],      // → Tag[]
  createdAt, updatedAt
}
```

**Indexes**

- Bookmark: `(userId, normalizedUrl)` **unique**
- Bookmark: `(userId, isArchived, createdAt)`
- Bookmark: `(userId, isPinned, updatedAt)`
- Tag: `(userId, name)` **unique**

**URL normalization** (high level)

- Lowercase host and strip `www.`
- Remove default ports (80/443)
- Remove tracking params (`utm_*`, `gclid`, `fbclid`…)
- Trim trailing `/` (except root)
- Sort remaining query params

---

## API Endpoints -->

<!-- **Bookmarks**

- `GET /api/bookmarks?q=&tags=tagId&tags=...&sort=recently-added|recently-visited|most-visited&archived=true|false`
- `POST /api/bookmarks` → create
- `GET /api/bookmarks/:id`
- `PATCH /api/bookmarks/:id`
- `DELETE /api/bookmarks/:id`
- `POST /api/visit/:id` → increments visitCount + sets lastVisitedAt

**Tags**

- `GET /api/tags`
- `POST /api/tags`
- `PATCH /api/tags/:id`
- `DELETE /api/tags/:id`

**Scraper**

- `POST /api/scrape` → `{ title, description, favicon }`

**Extension**

- `POST /api/extension/save` → saves current tab (requires site auth session)

All routes require authentication except where explicitly opened.

--- -->

<!-- ## Getting Started -->

<!-- ### Prerequisites

- Node 18+
- pnpm (or npm/yarn)
- MongoDB (Atlas or local)
- Cloudinary account (optional but recommended)

### Install

```bash
pnpm install
```

<!-- ### Environment Variables

Create `.env.local` in the project root:

```bash
MONGODB_URI="mongodb+srv://<user>:<pass>@cluster/name?retryWrites=true&w=majority"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your‑long‑random‑secret"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

> If you don’t want Google OAuth yet, you can add another NextAuth provider (e.g. GitHub or Credentials). -->

<!-- ### Run

```bash
pnpm dev
```

- App: [http://localhost:3000](http://localhost:3000)
- Sign in from the header; then create tags and bookmarks.

--- -->

<!--
## Seeding (optional)

If you have a local `data.json` from the challenge starter and want to preload:

```bash
pnpm tsx scripts/seed.ts
```

> Make sure you adapt the seeder to include `normalizedUrl` and your authenticated `userId`.

--- -->

<!-- ## Keyboard Shortcuts

- `⌘K / Ctrl+K` → Focus search
- `⌘B / Ctrl+B` → Open Add Bookmark dialog
- `Enter` on focused card → Open details
- `P` → Pin/unpin
- `A` → Archive/unarchive
- `C` → Copy URL

> All shortcuts are discoverable via a Command Palette (optional).

--- -->

<!-- ## PWA

- Basic offline caching via `public/sw.js` (static assets + last successful list response).
- Add to Home Screen with icons defined in `manifest.webmanifest`.
- Respect `prefers-reduced-motion` for animations.

--- -->

<!-- ## Browser Extension

**Manifest v3** with a single action button that posts `tab.url` to `/api/extension/save` using credentials. If not logged in, it opens the site’s sign‑in page. See `app/api/extension/save/route.ts` for server handling.

--- -->

<!-- ## Testing

- **Unit**: `normalizeUrl`, duplicate detection, scraper fallbacks.
- **Component**: Add/Edit form validation, Tag multi‑select, BookmarkCard interactions.
- **E2E (Playwright)**: add → edit → pin → visit → archive → search/filter/sort.

Run (suggested):

```bash
pnpm test
pnpm e2e
```

--- -->

<!-- ## Accessibility

- Keyboard‑navigable dialogs and menus, focus trapping, `aria-*` attributes.
- Visible focus ring; WCAG‑compliant color contrast.
- Motion‑safe: reduced motion variant for heavy transitions.

--- -->
<!--
## Performance

- Server Components for data fetching; incremental hydration for dialogs.
- Image dimensions reserved to prevent layout shift.
- List virtualization (optional) for very large libraries. -->

---

<!-- ## Roadmap

- [ ] Drag‑to‑reorder pinned bookmarks
- [ ] Bulk actions (multi‑select + batch PATCH)
- [ ] Import/Export (CSV/JSON/HTML bookmarks)
- [ ] Public share view (read‑only page)
- [ ] Per‑tag analytics (visited counts, last activity)

--- -->

<!-- ## FAQ

**Why store a normalized URL?**
To guarantee per‑user uniqueness and catch obvious duplicates that differ only by protocol, `www`, or tracking params.

**Do I need Cloudinary?**
No, you can store image URLs directly. Cloudinary helps normalize sizes, formats, and caching.

**Can I use credentials auth?**
Yes. Add a Credentials provider in NextAuth and secure the necessary routes.

--- -->

## License

This project’s code is MIT‑licensed. The Frontend Mentor premium **design file is not redistributable**; do not publish it.

---

## Acknowledgements

- Challenge by **[Frontend Mentor](https://www.frontendmentor.io/)**
- Favicon and metadata parsing: `cheerio`
- Images served by **Cloudinary**
