# FMR Landing Page

React + Vite + Tailwind SCSS landing page for Phase 1 lead capture.

## Start

```powershell
npm.cmd install
npm.cmd run dev
```

Preview at `http://localhost:5173`.

## Optional Backend Lead API

Copy `.env.example` to `.env` and run the Spring Boot backend at `http://localhost:8080`.

```powershell
Copy-Item .env.example .env
npm.cmd run dev
```

## Notes

- Tailwind utility classes handle layout and spacing.
- `src/styles.css` imports Tailwind and holds lightweight animations only.
- Animations use transform and opacity only, and respect `prefers-reduced-motion`.
- Form validation lives in `src/utils/leadValidation.ts`.
- API/local fallback logic lives in `src/utils/leadApi.ts`.
