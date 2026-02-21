# PERSONAL-BETA-CHECKLIST

Use this checklist for personal testing on Windows (PowerShell) before each local run/release.

## 1) One-time setup (or after dependency changes)
```powershell
cd C:\Users\Stryx\tax-software
npm install
```

## 2) Required environment (non-dev safety)
Set `NEXTAUTH_SECRET` for any non-development run (`build`, `start`, CI-like checks):

```powershell
$env:NEXTAUTH_SECRET = "replace-with-a-long-random-secret"
```

For normal local development (`npm run dev`), missing `NEXTAUTH_SECRET` is allowed.

## 3) Build/type safety gate
```powershell
npm run build
```
Expected: build succeeds with TypeScript errors enforced (no Next.js TS ignore override).

## 4) QA gates
```powershell
npm run qa
npm run qa:release-gate
```
Expected: both commands pass.

## 5) Local app run
```powershell
npm run dev
```
Then open: http://localhost:3000

## 6) Local data safety check
- Confirm `prisma/dev.db` is not tracked by git:
```powershell
git status --short
```
Expected: `prisma/dev.db` should **not** appear as a tracked change.

## 7) Quick auth sanity checks
- Register a test user in the UI.
- Log in with credentials.
- Confirm no sensitive request payload logging appears in normal output.

## Personal-beta caveats (not public launch)
- SQLite local DB is for single-user personal testing.
- Error handling/logging is intentionally minimal in auth/register and prisma init paths.
- Production/public hardening (rate limits, monitoring, backup/restore automation, secret rotation policy) is still out of scope for this personal beta.
