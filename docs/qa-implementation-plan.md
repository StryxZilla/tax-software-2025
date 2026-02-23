# QA & Reliability Implementation Plan

*Created: 2026-02-23 | Based on: qa-automation-research.md*

## Phase 1: Autosave/Resume + Foundation (NOW)
- [x] Robust localStorage autosave (already in TaxReturnContext)
- [x] DB persistence for authenticated users
- [ ] **Resume UI**: WelcomeScreen shows "Resume" + "Start over" when draft exists
- [ ] **Save status indicator**: Persistent badge showing save state
- [ ] **Tests**: autosave + restore flow, step persistence
- [ ] Typecheck + unit test pass

## Phase 2: Integration Tests Per Wizard Step (Week 1)
- RTL integration tests for each of the 11 wizard steps
- Pattern: render step → fill fields → validate → navigate → assert state
- Target: 3-5 tests per step (~40 integration tests)
- Add `vitest.setup.ts` with jsdom environment for component tests

## Phase 3: Visual Regression + Smoke Gates (Week 1-2)
- Extend existing Playwright visual-regression.spec.ts
- Add smoke gate: `test:smoke` = typecheck + unit + visual
- Screenshot baselines for each wizard step
- CI gate: PRs blocked on smoke failure

## Phase 4: CI Sharding & Anti-Flake (Week 2)
- GitHub Actions matrix strategy with 3 Playwright shards
- Blob reporter → merge-reports step
- Anti-flake rules:
  - No `waitForTimeout()` — use auto-retrying assertions
  - Retry 2x in CI, 0 locally
  - Flake budget: >5% flaky → stop feature work
  - Quarantine pattern: `test.fixme()` for known flaky tests
- Test timing budgets (unit <30s, integration <60s, E2E <3min)

## Priorities
1. **P0**: Autosave/resume (user-facing, prevents data loss)
2. **P0**: Integration test layer (highest bug-catching ROI)
3. **P1**: Visual regression gates (catch CSS/layout breaks)
4. **P1**: CI sharding (speed)
5. **P2**: AI-assisted test generation (coverage sprint)
