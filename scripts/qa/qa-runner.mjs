#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const argv = process.argv.slice(2);
const mode = getArgValue('--mode') || 'full';
const repoRoot = process.cwd();
const pkgPath = path.join(repoRoot, 'package.json');

if (!fs.existsSync(pkgPath)) {
  console.error('package.json not found. Run from repo root.');
  process.exit(2);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const scripts = pkg.scripts || {};

const requireUnit = isTruthy(process.env.QA_REQUIRE_UNIT);
const requireE2E = isTruthy(process.env.QA_REQUIRE_E2E);

const allSteps = [
  { id: 'lint', critical: true, required: true, candidates: ['lint'] },
  { id: 'typecheck', critical: true, required: true, candidates: ['typecheck', 'check-types'] },
  { id: 'unit', critical: requireUnit, required: false, candidates: ['test:unit', 'test', 'unit'] },
  { id: 'unit:critical', critical: true, required: true, candidates: ['test:unit:critical'] },
  { id: 'e2e', critical: requireE2E, required: false, candidates: ['test:e2e', 'e2e'] },
  { id: 'e2e:critical', critical: true, required: true, candidates: ['test:e2e:critical'] },
  { id: 'build', critical: true, required: true, candidates: ['build'] },
];

const quickStepIds = new Set(['lint', 'typecheck']);
const steps = mode === 'quick' ? allSteps.filter(s => quickStepIds.has(s.id)) : allSteps;

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const artifactsDir = path.join(repoRoot, 'artifacts', 'qa', timestamp);
fs.mkdirSync(artifactsDir, { recursive: true });

const summary = {
  mode,
  startedAt: new Date().toISOString(),
  repoRoot,
  artifactsDir,
  overallStatus: 'pass',
  criticalFailed: false,
  steps: [],
};

for (const step of steps) {
  const scriptName = step.candidates.find(name => Boolean(scripts[name]));
  const logPath = path.join(artifactsDir, `${step.id}.log`);

  if (!scriptName) {
    const status = step.required ? 'fail' : 'skipped';
    const skipped = {
      id: step.id,
      critical: step.critical,
      status,
      reason: `No npm script found (${step.candidates.join(', ')})`,
      scriptName: null,
      exitCode: null,
      durationMs: 0,
      logPath,
    };
    fs.writeFileSync(logPath, `${skipped.reason}\n`, 'utf8');
    summary.steps.push(skipped);
    if (step.critical && status !== 'pass') {
      summary.criticalFailed = true;
      summary.overallStatus = 'fail';
    }
    continue;
  }

  const started = Date.now();
  const result = await runScript(scriptName, repoRoot, logPath);
  const stepResult = {
    id: step.id,
    critical: step.critical,
    status: result.exitCode === 0 ? 'pass' : 'fail',
    reason: result.exitCode === 0 ? '' : `npm run ${scriptName} exited with code ${result.exitCode}`,
    scriptName,
    exitCode: result.exitCode,
    durationMs: Date.now() - started,
    logPath,
  };

  summary.steps.push(stepResult);
  if (step.critical && stepResult.status === 'fail') {
    summary.criticalFailed = true;
    summary.overallStatus = 'fail';
  }
}

summary.finishedAt = new Date().toISOString();

const summaryJsonPath = path.join(artifactsDir, 'summary.json');
const summaryMdPath = path.join(artifactsDir, 'summary.md');

fs.writeFileSync(summaryJsonPath, JSON.stringify(summary, null, 2), 'utf8');
fs.writeFileSync(summaryMdPath, toMarkdown(summary), 'utf8');

console.log(`QA summary written to: ${summaryJsonPath}`);
console.log(`QA markdown report: ${summaryMdPath}`);

process.exit(summary.criticalFailed ? 1 : 0);

function getArgValue(name) {
  const idx = argv.indexOf(name);
  if (idx === -1 || idx + 1 >= argv.length) return null;
  return argv[idx + 1];
}

function runScript(scriptName, cwd, logPath) {
  return new Promise((resolve) => {
    const child = spawn('npm', ['run', scriptName], { cwd, shell: true, windowsHide: true });
    const chunks = [];

    child.stdout.on('data', (d) => {
      process.stdout.write(d);
      chunks.push(Buffer.from(d));
    });

    child.stderr.on('data', (d) => {
      process.stderr.write(d);
      chunks.push(Buffer.from(d));
    });

    child.on('close', (exitCode) => {
      fs.writeFileSync(logPath, Buffer.concat(chunks).toString('utf8'), 'utf8');
      resolve({ exitCode: Number.isInteger(exitCode) ? exitCode : 1 });
    });

    child.on('error', (err) => {
      const msg = `Failed to start npm run ${scriptName}: ${err.message}\n`;
      fs.writeFileSync(logPath, msg, 'utf8');
      resolve({ exitCode: 1 });
    });
  });
}

function toMarkdown(report) {
  const lines = [];
  lines.push('# QA Summary');
  lines.push('');
  lines.push(`- Mode: ${report.mode}`);
  lines.push(`- Overall: **${report.overallStatus.toUpperCase()}**`);
  lines.push(`- Critical failed: ${report.criticalFailed}`);
  lines.push(`- Started: ${report.startedAt}`);
  lines.push(`- Finished: ${report.finishedAt}`);
  lines.push(`- Artifacts: ${report.artifactsDir}`);
  lines.push('');
  lines.push('## Steps');
  lines.push('');
  lines.push('| Step | Critical | Status | Script | Exit | Duration (ms) | Reason |');
  lines.push('|---|---:|---|---|---:|---:|---|');

  for (const s of report.steps) {
    lines.push(`| ${s.id} | ${s.critical} | ${s.status} | ${s.scriptName ?? '-'} | ${s.exitCode ?? '-'} | ${s.durationMs} | ${escapePipes(s.reason || '-')} |`);
  }

  lines.push('');
  return lines.join('\n');
}

function escapePipes(text) {
  return String(text).replace(/\|/g, '\\|');
}

function isTruthy(value) {
  if (!value) return false;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}
