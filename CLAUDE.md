# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Fix My Room (FMR) — a B2B SaaS maintenance tracker for hotels/villas/serviced apartments. Staff report room issues from a mobile app, managers assign technicians and track repair costs, technicians resolve and close tickets. Issue lifecycle: `NEW → ASSIGNED → IN_PROGRESS → WAITING_PARTS → COMPLETED` (or `CANCELLED`).

Three independent projects in one repo, each with its own dependency tree:
```
backend/        Spring Boot API (Java 17, H2 database, JWT auth)
frontend/       Expo React Native app (mobile + desktop web) — the actual product
landing-page/   Marketing site (React + Vite + Tailwind CSS) — unrelated to the app, just markets it
```

## Commands

**Backend** (`backend/`):
```powershell
.\run.ps1                 # loads .env then runs the API at http://localhost:8080
mvn test                  # run tests
mvn test -Dtest=SecurityConfigTest   # run a single test class
```
Config comes from `backend/.env` (see `.env.example`); requires `FMR_JWT_SECRET` (32+ bytes) outside the `dev` Spring profile — the app fails fast without it. Demo accounts seed automatically on first boot (see Readme.md for credentials). **Plain `mvn spring-boot:run` will fail** — Spring Boot doesn't read `.env` files on its own (no dotenv library is wired in; one was tried and reverted — flaky `EnvironmentPostProcessor` ordering on this setup caused it to work on some runs and not others). `run.ps1` loads `.env` into the process environment first, deterministically, then calls `mvn spring-boot:run`. On non-Windows, source `.env` into your shell yourself before running Maven.

**Frontend** (`frontend/`):
```bash
npm install
npx expo start            # opens web at http://localhost:8081
npm run typecheck         # tsc --noEmit — no test suite exists
```
Requires `.env` with `EXPO_PUBLIC_API_URL` (copy from `.env.example`).

**Landing page** (`landing-page/`):
```bash
npm install
npm run dev                # vite dev server at http://localhost:5173
npm run build               # tsc --noEmit && vite build
npm run typecheck
```

## Backend architecture

- **No JPA/Hibernate.** Uses `spring-boot-starter-jdbc` with hand-written `JdbcTemplate` + `RowMapper` repositories and raw SQL. There are no entity classes — look in `*Repository.java` for the actual SQL.
- **Package-by-feature**, not layer-by-layer: `auth`, `issue`, `room`, `leads`, `finance`, `dashboard`, `support`, `email`, each holding its own Controller → Service → Repository → request/response DTOs. `common/` and `config/` hold cross-cutting pieces.
- **Schema is Liquibase-owned**: `db/changelog/db.changelog-master.xml`. `spring.sql.init.mode: never` — `schema.sql` is *not* live, it's reused only as the idempotent baseline inside changeset `001-baseline-schema` (`CREATE TABLE IF NOT EXISTS`/`ADD COLUMN IF NOT EXISTS`, safe to re-run). Add new schema changes as new changesets, never edit `schema.sql` expecting it to apply to an existing DB.
- **Multi-tenancy via JWT, not path params.** Every JWT carries a tenant id claim; `com.fixmyroom.common.JwtTenant` is the *only* place that reads it (`JwtTenant.businessId(jwt)`). Controllers pull the tenant id from `@AuthenticationPrincipal Jwt` and pass it into every service/repository call — never trust a tenant id from the request body/path. The tenant table was renamed `hotels` → `businesses` (`business_id` is canonical); `hotel_id` columns still exist and are dual-written for backward compatibility with tokens issued before the rename — `JwtTenant` falls back to the legacy `hotel_id`/`hotel_name` claims if `business_id`/`business_name` are absent. Don't remove the `hotel_id` fallback without confirming all clients have re-issued tokens.
- **Auth**: stateless JWT (HS256, `spring-boot-starter-oauth2-resource-server` as a resource server validating its own self-issued tokens), roles `STAFF` / `MANAGER` / `TECHNICIAN` carried in the `roles` claim → mapped to `ROLE_*` authorities. Endpoints are locked down with `@PreAuthorize("hasRole(...)")`/`hasAnyRole(...)` at the controller method level; `SecurityConfig` only whitelists public routes (login/register/leads/support-chat/password-reset/uploads/health).
- **Errors**: `GlobalExceptionHandler` (`@RestControllerAdvice`) converts validation/auth/not-found exceptions into a uniform `ApiError` JSON shape (`errorId`, `message`, `fieldErrors`, `timestamp`). Frontend's `ApiClientError` (`frontend/src/api/http.ts`) expects exactly this shape.
- **File uploads** (issue photos) are saved to disk under `./uploads` and served back via `WebConfig`'s `/uploads/**` static resource mapping (public, no auth).
- **Local DB** is a file-based H2 instance at `backend/data/fmr-phase1.mv.db` (`MODE=PostgreSQL`, prod target is real PostgreSQL) — persists across restarts, so schema/data changes from a previous run carry forward. Delete the `data/` files to force a clean re-seed if the local DB gets into a bad state.

## Frontend architecture

- Single Expo app that renders as both the mobile app and the desktop/web dashboard (`react-native-web`); layout branches on `useBreakpoint()`'s `isDesktop` (sidebar shell) vs mobile.
- No routing library — `frontend/src/navigation/NavigationContext.tsx` is a hand-rolled screen-stack context; `AppScreen` is a discriminated union of screen name + params. `screens/AppNavigator.tsx` is the single root switch that maps `current.name` to a screen component, and also decides nav-sidebar contents per role (`getNavItems(role)`).
- Auth/session state lives in `src/auth/AuthContext.tsx`: reads/writes the JWT via `tokenStorage.ts` (Expo SecureStore), restores session on boot by calling `getCurrentEmployee`, and exposes `login`/`register`/`logout`. `AppNavigator` gates on `state.status` (`loading` / `anonymous` / `authenticated`) before rendering the router.
- API calls go through `src/api/http.ts`'s `apiRequest<T>()` — a thin fetch wrapper that attaches the bearer token, parses the backend's `ApiError` shape into `ApiClientError` (with `status` + `fieldErrors`), and is the base every `*Api.ts` module (`authApi`, `issueApi`, `roomApi`, etc.) builds on. Reuse it for new endpoints rather than calling `fetch` directly.
- Employee role (`STAFF`/`MANAGER`/`TECHNICIAN`) drives both navigation options and which dashboard variant renders on the `Dashboard` screen — check `AppNavigator.tsx`'s `getNavItems`/`AppRouter` when adding a role-gated feature.
