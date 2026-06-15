# FMR Backend

Spring Boot 4.1.0 API for FMR. It now includes Phase 1 lead capture plus the first MVP auth slice for Staff, Manager, and Technician roles.

## Start

```powershell
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.

## Auth Demo Users

Demo users are seeded automatically when `app.seed.enabled` is true.

```text
staff@fixmyroom.test
manager@fixmyroom.test
technician@fixmyroom.test
```

Password:

```text
Password123!
```

Override the local demo password before first startup with:

```powershell
$env:FMR_DEMO_PASSWORD="A stronger local password"
```

## Auth Endpoints

```http
POST /api/auth/login
GET /api/auth/me
GET /api/staff/dashboard
GET /api/manager/dashboard
GET /api/technician/dashboard
```

Dashboards are protected by backend role checks. For example, a manager token cannot access the staff dashboard.

## Phase 1 Lead Endpoint

```http
POST /api/leads
```

The endpoint validates lead requests, persists them to local H2 storage, and logs errors to `logs/fmr-api.log`.

## Local Files

- `data/`: local H2 database files.
- `logs/`: application and error logs.

## Security Environment Variables

Use a real secret in production:

```text
FMR_JWT_SECRET=change-this-to-a-long-random-secret-of-at-least-32-bytes
FMR_JWT_ISSUER=fmr-local
FMR_JWT_TTL_MINUTES=480
FMR_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081
FMR_SEED_DEMO_USERS=true
FMR_DEMO_PASSWORD=Password123!
```

## Production Direction

Replace H2 with PostgreSQL, add Flyway migrations, keep JWT validation behind a managed identity provider or strong signing key, enforce hotel access on every query, and add modules for hotels, rooms, tickets, suppliers, dispatch logs, technician updates, and status history.
