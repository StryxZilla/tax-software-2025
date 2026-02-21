# 2025 Tax Preparation Software

A tax preparation app for the 2025 tax year built with Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma, and SQLite.

## Fast Path (Windows)

```powershell
cd C:\Users\Stryx\tax-software
npm run win:setup
npm run win:run
```

In a second terminal:

```powershell
cd C:\Users\Stryx\tax-software
npm run win:verify   # expects app running on localhost:3000
npm run win:qa
```

## Features

- Guided tax prep workflow across common personal tax scenarios
- Built-in calculations for 2025 tax logic
- Auth + saved return flow
- OCR-assisted document upload support (W-2 / 1099-INT)
- PDF output generation

## Requirements

- Node.js 20+ (tested on Node 24)
- npm

## Install

> Windows users should follow the full setup in [`SETUP-WINDOWS.md`](./SETUP-WINDOWS.md).

```powershell
cd C:\Users\Stryx\tax-software
npm install
npx prisma db push
```

Create `.env.local` if needed:

```env
NEXTAUTH_SECRET=taxflow-2025-secret-key-change-in-prod-xK9mP2nQ
NEXTAUTH_URL=http://localhost:3000
```

Run locally:

```powershell
npm run dev
```

Open http://localhost:3000

## QA / Testing

```powershell
npm run qa:quick
npm run qa
npm run qa:release-gate
```

Artifacts are written to `artifacts/qa/<timestamp>/` with:
- `summary.json`
- `summary.md`
- step logs (`lint.log`, `typecheck.log`, `build.log`, etc.)

Manual scenario testing:
- [`TESTING.md`](./TESTING.md)
- [`TESTING-WINDOWS.md`](./TESTING-WINDOWS.md)

## Tech Stack

- Next.js 16.1.6
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Prisma 7 + SQLite
- NextAuth 5 beta
- pdf-lib
- tesseract.js
