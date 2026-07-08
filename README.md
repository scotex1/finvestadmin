# FinVest Admin

Standalone Next.js 14 admin panel — separated from the main FinVest user app
so it can be deployed independently (own subdomain, e.g. `admin.finvest.app`,
own security boundary, smaller/no public bundle exposure).

## Setup

```bash
npm install
cp .env.local.example .env.local   # same Firebase project + backend API as the main app
npm run dev
```
Runs on `http://localhost:3001` (different port from the main app's 3000, so
you can run both side by side locally).

## Verified

- ✅ `tsc --noEmit` — zero type errors
- ✅ `next build` — zero errors, all 7 routes generate successfully
- ✅ No unused imports

## Structure

```
app/
  login/page.tsx           → admin-only sign-in (no public signup)
  (protected)/              → route group, shares one AdminGuard'd shell
    layout.tsx               → Navbar + Sidebar + AdminGuard
    overview/page.tsx
    users/page.tsx           → search/filter/pagination, activate/deactivate,
                                promote/demote admin, delete
    payments/page.tsx        → filterable payment history across all users
    plans/page.tsx           → edit plan pricing/name/active status
components/
  AuthGuard, AdminGuard, AuthInitializer, ProfileSync
  layout/Navbar.tsx, Sidebar.tsx
  ui/ → Card, Button, Input, Select, Badge, StatCard
hooks/useAuth.ts
store/authStore.ts   → uid, profile, isAdmin only (no plan/engine fields —
                        not needed in the admin app)
lib/{firebase,api,utils}.ts   → trimmed to what admin actually calls
```

## How admin access works

This app shares the **same Firebase project and backend** as the main
FinVest user app — there's no separate admin auth system. Login here is the
same Firebase email/password sign-in; access is gated entirely by the
backend's `is_admin` flag on the user's profile:

1. Sign in → `AuthInitializer` resolves the Firebase session
2. `ProfileSync` (mounted inside `AdminGuard`, not inside the gated check —
   this ordering matters, see the comment in `AdminGuard.tsx`) calls
   `GET /user/profile` and reads `is_admin`
3. If `is_admin` is false, redirected to `/login?error=not-authorized`
4. If `is_admin` is true, the protected shell renders

**Bootstrapping the first admin:** there's no chicken-and-egg UI for this by
design — set `is_admin = true` directly in your database for the first
account. After that, existing admins can promote/demote other users from
the Users page.

## Security reminder

`AdminGuard` is a **client-side UX gate only**. Your backend must
independently verify the caller is an admin (via Firebase ID token +
DB lookup) on every `/admin/*` endpoint — never trust this frontend check
as the actual access boundary. Anyone can open devtools and call the API
directly, bypassing this app entirely.

## Why a separate project instead of `/admin` inside the main app

- Smaller bundle for regular users (they never download admin code)
- Can be deployed to a different domain/subdomain with stricter access
  rules (VPN-only, IP allowlist, etc. at the hosting layer)
- Clear security boundary — a bug in the marketing site or dashboard can't
  accidentally expose admin routes
