#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const artifactsRoot = path.join(repoRoot, 'artifacts', 'qa');
const argPath = getArgValue('--summary');

const summaryPath = argPath
  ? path.resolve(repoRoot, argPath)
  : findLatestSummary(artifactsRoot);

if (!summaryPath || !fs.existsSync(summaryPath)) {
  console.error('No QA summary found. Run `npm run qa` first or pass --summary <path>.');
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const normalized = normalizeChecks(report);
const requiredChecks = ['unit:critical', 'e2e:critical'];
const missingRequired = requiredChecks.filter((id) => !normalized.some((s) => s.id === id));
const criticalSteps = normalized.filter(s => s.critical);
const failedCritical = criticalSteps.filter(s => s.status !== 'pass');

console.log(`Release gate using summary: ${summaryPath}`);

if (missingRequired.length > 0) {
  console.error('Release gate FAILED. Missing required critical checks:');
  for (const id of missingRequired) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

if (failedCritical.length > 0) {
  console.error('Release gate FAILED. Critical checks not passing:');
  for (const step of failedCritical) {
    console.error(`- ${step.id}: ${step.status} (${step.reason || 'no reason'})`);
  }
  process.exit(1);
}

console.log('Release gate PASSED. All critical checks passed.');
process.exit(0);

function getArgValue(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function findLatestSummary(root) {
  if (!fs.existsSync(root)) return null;
  const dirs = fs.readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  for (let i = dirs.length - 1; i >= 0; i--) {
    const candidate = path.join(root, dirs[i], 'summary.json');
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function normalizeChecks(report) {
  if (Array.isArray(report.steps)) {
    return report.steps.map(s => ({
      id: s.id,
      critical: Boolean(s.critical),
      status: s.status,
      reason: s.reason || ''
    }));
  }

  if (Array.isArray(report.checks)) {
    return report.checks.map(c => ({
      id: c.id,
      critical: Boolean(c.critical),
      status: c.status === 'passed' ? 'pass' : c.status,
      reason: c.reason || ''
    }));
  }

  return [];
}
