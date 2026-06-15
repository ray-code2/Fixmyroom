# FMR Mobile App

Expo React Native app for the FMR MVP. The first implemented slice is secure role-based authentication and separate dashboards for Staff, Manager, and Technician.

## Start Locally

Start the backend first:

```powershell
cd "c:\Users\raymo\My Files\React Native (Business)\Fixmyroom\backend"
mvn spring-boot:run
```

Then start the mobile app:

```powershell
cd "c:\Users\raymo\My Files\React Native (Business)\Fixmyroom\frontend"
npm.cmd install
Copy-Item .env.example .env
npm.cmd run start
```

For Android Emulator, set this in `.env`:

```text
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

For Expo web or iOS simulator on the same machine:

```text
EXPO_PUBLIC_API_URL=http://localhost:8080
```

For a physical phone, replace `localhost` with your computer LAN IP address.

## Demo Users

All demo users use:

```text
Password123!
```

```text
staff@fixmyroom.test
manager@fixmyroom.test
technician@fixmyroom.test
```

## Implemented Auth Slice

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/staff/dashboard`
- `GET /api/manager/dashboard`
- `GET /api/technician/dashboard`

The backend signs JWT access tokens. The mobile app stores them with Expo SecureStore on native platforms and uses backend-verified role routing.

The auth screen includes a polished login/sign-up card, role selection for Staff, Technician, and Hotel Manager, and compact demo user chips. Sign-up is UI-ready; the secure account creation endpoint should be added in the next backend slice before accepting real users.

## Next MVP Screens

- Staff report creation: choose room, upload before photo, add note, submit.
- Manager approval queue: review AI recommendation, approve/edit/reject dispatch.
- Technician ticket queue: submit fix date, hours, cost, proof photo, cancel/reschedule with note.
