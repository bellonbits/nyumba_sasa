# 🧠 CLAUDE PROJECT CONTEXT — NYUMBA SASA (African Housing Marketplace)

## PROJECT NAME
**Nyumba Sasa** — Swahili for "House Now". A mobile-first housing marketplace for African communities.

## PROJECT GOAL
Build a mobile-first housing marketplace simplifying house hunting (rent & buy) across Africa, optimized for low bandwidth and mobile usage.

Deployed as:
- **Web app** via Next.js on Vercel
- **Mobile apps** via Capacitor (iOS & Android)

---

## TECH STACK

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 15 (App Router), TypeScript |
| Styling     | Tailwind CSS, shadcn/ui             |
| Mobile      | Capacitor 6                         |
| Backend     | Next.js API Routes (Vercel serverless) |
| Database    | Supabase (PostgreSQL)               |
| Auth        | Supabase Auth (phone/email)         |
| Storage     | Cloudinary (images)                 |

---

## PROJECT STRUCTURE

```
nyumba-sasa/
├── app/
│   ├── (auth)/           # Login, Register
│   ├── (main)/           # Main app with bottom nav
│   │   ├── home/
│   │   ├── search/
│   │   ├── favorites/
│   │   ├── messages/
│   │   ├── profile/
│   │   └── listings/[id]/
│   ├── onboarding/
│   ├── agent/            # Agent dashboard
│   ├── admin/            # Admin dashboard
│   └── api/
│       ├── listings/
│       ├── users/
│       ├── messages/
│       └── favorites/
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── PropertyCard.tsx
│   ├── BottomNav.tsx
│   ├── FilterChips.tsx
│   ├── ImageCarousel.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── supabase/
│   ├── cloudinary.ts
│   ├── types.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useListings.ts
│   └── useFavorites.ts
└── supabase/
    ├── schema.sql
    └── rls.sql
```

---

## DESIGN SYSTEM

- **Mobile-first** (375px base, scale up)
- **Border radius**: 20px for cards (`rounded-2xl`)
- **Shadows**: `shadow-card` (0 4px 24px rgba(0,0,0,0.08))
- **Accent color**: `#FF6A00` (brand.orange)
- **Spacing**: 8px grid system
- **Card layout**: image → title → location → price
- **Bottom nav**: fixed, 5 tabs (Home, Search, Favorites, Messages, Profile)

---

## ROLE SYSTEM

### USER
- Browse approved listings
- Save favorites
- Contact agent via messages

### AGENT (Landlord/Property Manager)
- Create / edit / delete own listings
- Upload property images via Cloudinary
- Manage inquiries from users

### ADMIN
- Approve / reject pending listings
- Manage all users
- Moderate content
- View analytics

---

## DATABASE SCHEMA

### users
| Column     | Type      | Notes                     |
|------------|-----------|---------------------------|
| id         | uuid (PK) | auth.users reference      |
| name       | text      |                           |
| phone      | text      |                           |
| role       | enum      | user \| agent \| admin    |
| avatar_url | text      | Cloudinary URL            |
| created_at | timestamp |                           |

### listings
| Column      | Type      | Notes                          |
|-------------|-----------|--------------------------------|
| id          | uuid (PK) |                                |
| title       | text      |                                |
| description | text      |                                |
| price       | numeric   | Monthly rent or sale price     |
| listing_type| enum      | rent \| buy                    |
| location    | text      |                                |
| city        | text      |                                |
| bedrooms    | int       |                                |
| bathrooms   | int       |                                |
| area_sqm    | numeric   |                                |
| images      | text[]    | Cloudinary URLs array          |
| amenities   | text[]    | e.g. ['WiFi','Parking','Pool'] |
| agent_id    | uuid (FK) | → users.id                     |
| status      | enum      | pending \| approved \| rejected|
| created_at  | timestamp |                                |

### favorites
| Column     | Type      |
|------------|-----------|
| id         | uuid (PK) |
| user_id    | uuid (FK) |
| listing_id | uuid (FK) |
| created_at | timestamp |

### messages
| Column      | Type      |
|-------------|-----------|
| id          | uuid (PK) |
| sender_id   | uuid (FK) |
| receiver_id | uuid (FK) |
| listing_id  | uuid (FK) |
| text        | text      |
| is_read     | boolean   |
| created_at  | timestamp |

---

## API ROUTES

```
GET    /api/listings          → list approved listings (with filters)
POST   /api/listings          → create listing (agent only)
GET    /api/listings/[id]     → get single listing
PATCH  /api/listings/[id]     → update listing (owner or admin)
DELETE /api/listings/[id]     → delete listing (owner or admin)

GET    /api/users/[id]        → get user profile
PATCH  /api/users/[id]        → update profile (self only)

GET    /api/favorites         → get user's favorites
POST   /api/favorites         → add favorite
DELETE /api/favorites/[id]    → remove favorite

GET    /api/messages          → get conversation list
POST   /api/messages          → send message
GET    /api/messages/[id]     → get messages in a conversation
```

---

## SECURITY RULES

- Only agents/admins can create listings
- Only the listing owner or admin can edit/delete
- Only admins can approve listings
- Supabase RLS enforces all access at DB level
- API routes validate session via `@supabase/ssr`

---

## AFRICA-SPECIFIC OPTIMIZATIONS

- Phone number authentication as primary method
- WhatsApp deep link for quick contact: `https://wa.me/{phone}`
- Image compression before Cloudinary upload (max 800px width, 80% quality)
- Skeleton loading states for slow connections
- Offline-friendly: cache last-viewed listings in localStorage
- Avoid heavy animations on low-end devices (use `prefers-reduced-motion`)

---

## PERFORMANCE PRIORITIES

- Next.js `Image` component with lazy loading for all property images
- Paginate listings (12 per page)
- Minimize JS bundle (avoid large third-party libs)
- Use `React.memo` for `PropertyCard` to prevent re-renders
- API responses cached with `Cache-Control: s-maxage=60`

---

## CAPACITOR NOTES

- `webDir: "out"` — requires `output: "export"` in next.config for mobile builds
- Use `safe-area-inset-*` CSS variables for notch/bottom bar
- Test on real Android device (low-end: 2GB RAM)
- No browser URL bar — design for full-screen

---

## ENVIRONMENT VARIABLES

See `.env.example`. Never commit `.env.local`.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## CODING RULES

1. Use reusable components — no copy-pasted JSX blocks
2. Keep files modular — one concern per file
3. Use environment variables — no hardcoded URLs or keys
4. TypeScript strict mode — no `any` types
5. API routes must: validate input, check session, enforce role
6. Prefer Server Components — use `"use client"` only when needed
7. Handle loading + error states on every data-fetching component

---

## CLAUDE BEHAVIOR GUIDELINES

- Think like a senior full-stack engineer
- Prioritize scalability and simplicity
- Avoid overengineering — YAGNI
- Always stay within Vercel serverless constraints (no long-running processes)
- When generating code, always include imports and proper TypeScript types
- Production-ready means: no TODOs, no placeholder text in logic, proper error handling
