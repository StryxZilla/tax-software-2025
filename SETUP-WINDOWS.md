# Tax Software - Windows Setup

Tested on Windows 11 + PowerShell.

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
NEXTAUTH_SECRET=taxflow-2025-secret-key-change-in-prod-xK9mP2nQ
NEXTAUTH_URL=http://localhost:3000
```

Initialize Prisma/SQLite:

```powershell
npx prisma db push
```

Optional test user:

```powershell
node create-test-user.js
```

Default test credentials:
- `john.sample@testmail.com`
- `testpassword123`

## Run

```powershell
npm run dev
```

Expected banner includes `Next.js 16.1.6` and localhost URL.

## Useful Commands

```powershell
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
node create-test-user.js
```

Clean local build artifacts:

```powershell
Remove-Item -Recurse -Force .next
```
