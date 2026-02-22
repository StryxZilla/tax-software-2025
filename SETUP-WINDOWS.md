# Tax Software - Windows Setup

Tested on Windows 11 + PowerShell.

## Fast Path (Copy/Paste)

```powershell
cd C:\Users\Stryx\tax-software
npm run win:setup
npm run win:run
```

Healthcheck + QA gate:

```powershell
npm run win:verify
npm run win:qa
```

## Prerequisites

- Node.js 20+ (tested: 24.13.0)
- npm

## Setup

```powershell
cd C:\Users\Stryx\tax-software
npm install
```

Create `.env.local` in project root if missing:

```env
# Generate once: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET=replace-with-a-random-secret
NEXTAUTH_URL=http://localhost:3000
# Optional: set false to disable first-user admin assignment
# PERSONAL_MODE_FIRST_USER_ADMIN=true
```

Initialize Prisma/SQLite:

```powershell
npx prisma db push
```

Run app:

```powershell
npm run dev
```

Open http://localhost:3000 and create your account from the UI.

## Useful Commands

```powershell
npm run win:setup
npm run win:run
npm run win:verify
npm run win:qa
npm run build
npm start
npm run lint
npm run typecheck
npm run qa
npm run qa:release-gate
npx prisma studio
```

## Troubleshooting

Port 3000 in use:

```powershell
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

Reset DB (destructive):

```powershell
npx prisma db push --force-reset
```

Clean local build artifacts:

```powershell
Remove-Item -Recurse -Force .next
```
