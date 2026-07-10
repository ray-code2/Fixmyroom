# Fix My Room (FMR)

A B2B SaaS hotel maintenance tracker. Staff report room issues, managers assign technicians and track costs, technicians resolve and close tickets — all in one system.

---

## What It Does

- **Staff** report room problems (broken AC, leaking tap, faulty lock) from a mobile app
- **Manager** sees all open issues on a desktop dashboard, assigns technicians, and tracks estimated vs actual repair costs
- **Technicians** log in to see their assigned tasks and update status as work progresses
- Issues move through a clear lifecycle: `NEW → ASSIGNED → IN PROGRESS → WAITING PARTS → COMPLETED`
- Manager gets a built-in AI support chat (Gemini) for help and account management
- Cost tracking per ticket with estimate vs actual variance shown on every issue
- XLSX export of monthly maintenance costs ready for accountants

---

## Who It's For

Boutique hotels, villas, serviced apartments, and vacation rental managers who need a simple trackable system for room repairs — without spreadsheets or WhatsApp threads.

---

## Project Structure

```
Fixmyroom/
  backend/        Spring Boot API (Java 17, H2 database, JWT auth)
  frontend/       Expo React Native app (mobile + desktop web)
  landing-page/   Marketing site (React + Vite + Tailwind CSS)
```

---

## Quick Start

**1. Start the backend**
```powershell
cd backend
.\run.ps1
```
`mvn spring-boot:run` alone will NOT work — Spring Boot doesn't read `.env` files, so `FMR_JWT_SECRET` won't resolve. `run.ps1` loads `.env` into the environment first, then runs Maven. (Not on Windows? Source `.env` into your shell yourself, then run `mvn spring-boot:run`.)

Runs at `http://localhost:8080`. Demo accounts are seeded automatically on first run.

**2. Start the mobile / web app**
```bash
cd frontend
npm install
cp .env.example .env
npx expo start
```
Open in browser at `http://localhost:8081`

**3. Start the landing page** *(optional)*
```bash
cd landing-page
npm install
npm run dev
```
Opens at `http://localhost:5173`

---

## Demo Accounts

All accounts use password: **`Password123!`**

### Sunniress Hotel

| Role | Email |
|---|---|
| Manager | `raymondtjahyadi00@gmail.com` |
| Staff | `staff.farid@sunniress.com` |
| Staff | `staff.nurul@sunniress.com` |
| Staff | `staff.lim@sunniress.com` |
| Technician | `tech.raj@sunniress.com` |
| Technician | `tech.zul@sunniress.com` |
| Technician | `tech.lee@sunniress.com` |

### Generic Demo Property

| Role | Email |
|---|---|
| Manager | `manager@fixmyroom.test` |
| Staff | `staff@fixmyroom.test` |
| Technician | `technician@fixmyroom.test` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile / Web App | Expo React Native, TypeScript |
| Backend API | Spring Boot 4.1, Java 17 |
| Database | H2 (dev) → PostgreSQL (prod) |
| Auth | JWT (HS256), role-based access control |
| AI Support Chat | Google Gemini Flash (free tier) |
| Cost Reports | Apache POI — XLSX export |
| Landing Page | React + Vite + Tailwind CSS |

---

## Environment Variables

**Frontend** (`.env`):
```
EXPO_PUBLIC_API_URL=http://localhost:8080
```

**Backend** (`.env`):
```
GEMINI_API_KEY=your_gemini_api_key
FMR_JWT_SECRET=change-this-in-production
FMR_SEED_DEMO_USERS=true
FMR_DEMO_PASSWORD=Password123!
```
