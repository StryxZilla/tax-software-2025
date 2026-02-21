# Tax Software Testing Guide (Windows)

Windows/PowerShell testing workflow.

## Start App

```powershell
cd C:\Users\Stryx\tax-software
npm run dev
```

Open: http://localhost:3000

## Use Sample Data

Use `test-data.json` and the scenario in `TESTING.md` to run end-to-end manual validation.

## QA Commands

```powershell
npm run qa:quick
npm run qa
npm run qa:release-gate
```

QA artifacts are generated under `artifacts\qa\<timestamp>\`:
- `summary.json`
- `summary.md`
- per-step logs (for example `lint.log`, `typecheck.log`, `build.log`)

## Database / User Utilities

```powershell
npx prisma studio
npx prisma db push
npx prisma db push --force-reset   # destructive
node create-test-user.js
```

## Port / Process Utilities

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```
