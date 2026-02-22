# FIRST-RUN (Personal Use)

This walkthrough is the default no-script flow.

## 1) Start the app

```powershell
cd C:\Users\Andy\tax-software-2025
npm run win:setup
npm run win:run
```

Open http://localhost:3000

> If prompted for auth, go to `/auth/register`.

## 2) Create your account in-app

1. Click **Create one free** on the login page.
2. Enter name, email, and password (8+ chars).
3. Submit **Create account**.
4. You should be signed in automatically and land in the app.

Personal mode note:
- By default, the **first account** created in this install becomes admin (`PERSONAL_MODE_FIRST_USER_ADMIN=true`).
- Set `PERSONAL_MODE_FIRST_USER_ADMIN=false` in `.env.local` if you do not want this.

## 3) Enter and save your return

1. Click **Start** from the welcome screen.
2. Fill out **Personal Information** (required fields marked `*`).
3. Click **Next** to continue.
4. Data is auto-saved to your account as you edit.

## 4) Log out and log back in

1. Click **Sign out** in the top-right header.
2. Log in again using your email/password.
3. Confirm your previously entered return data is still there.

## 5) Optional verification checks

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
```
