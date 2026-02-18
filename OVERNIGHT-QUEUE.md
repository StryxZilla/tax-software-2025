# Overnight Feature Queue

Status tracked here so cron can pick up next feature when one completes.

## Queue (in order)

- [ ] **auth** - Multi-user login with NextAuth.js + SQLite (email/password)
- [ ] **data-persistence** - Save tax returns to DB per user (tied to auth)
- [ ] **input-formatting** - Auto-format SSN, EIN, currency fields
- [ ] **help-tooltips** - Contextual help on complex fields (AMT, SE tax, mega backdoor Roth)
- [ ] **pdf-polish** - Better PDF layout, closer to actual IRS form styling
- [ ] **mobile-polish** - Improve responsiveness on small screens
- [ ] **dark-mode** - Dark theme toggle
- [ ] **print-view** - Print-friendly summary page

## Completed
(none yet - starting now)

## Rules for overnight agent
- One feature per branch: feature/<name>
- Build → test → commit → push
- Mark [ ] as [x] in this file when done
- Never break master - always branch
