import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { existsSync } from 'fs';
import { resolve } from 'path';
import ZoeyImage from '../../components/brand/ZoeyImage';

const publicDir = resolve(__dirname, '../../public');

describe('ZoeyImage', () => {
  it('renders an img tag with the given src on initial render', () => {
    const html = renderToString(
      <ZoeyImage src="/brand/zoey-hero-wide.png" alt="Zoey hero" data-testid="hero" />,
    );
    expect(html).toContain('src="/brand/zoey-hero-wide.png"');
    expect(html).toContain('alt="Zoey hero"');
    expect(html).toContain('<img');
  });

  it('passes through className', () => {
    const html = renderToString(
      <ZoeyImage src="/brand/zoey-neutral.png" alt="Zoey" className="w-8 h-8 rounded-lg" />,
    );
    expect(html).toContain('w-8 h-8 rounded-lg');
  });

  it('renders correct src for draft (celebrate) variant', () => {
    const html = renderToString(
      <ZoeyImage src="/brand/zoey-celebrate.png" alt="Zoey celebrating" />,
    );
    expect(html).toContain('src="/brand/zoey-celebrate.png"');
  });

  it('renders correct src for fresh (hero-wide) variant', () => {
    const html = renderToString(
      <ZoeyImage src="/brand/zoey-hero-wide.png" alt="Zoey" />,
    );
    expect(html).toContain('src="/brand/zoey-hero-wide.png"');
  });

  it('includes data-testid when provided', () => {
    const html = renderToString(
      <ZoeyImage src="/brand/zoey-neutral.png" alt="Zoey" data-testid="my-img" />,
    );
    expect(html).toContain('data-testid="my-img"');
  });

  it('renders login-page tip variant (zoey-pointing) correctly', () => {
    const html = renderToString(
      <ZoeyImage src="/brand/zoey-pointing.png" alt="Zoey the corgi guide" />,
    );
    expect(html).toContain('src="/brand/zoey-pointing.png"');
    expect(html).toContain('alt="Zoey the corgi guide"');
  });

  it('SSR output includes ref-compatible img (no dangling state)', () => {
    // Ensures the server render produces a plain <img> that the client
    // can hydrate and attach the error/ref handler to.
    const html = renderToString(
      <ZoeyImage src="/brand/zoey-pointing.png" alt="Zoey" data-testid="login-zoey" />,
    );
    // Must be a real <img>, not the <span> fallback
    expect(html).toMatch(/<img[^>]+src="\/brand\/zoey-pointing\.png"/);
    expect(html).not.toContain('role="img"');
  });
});

describe('ZoeyImage fallback assets exist on disk', () => {
  it.each([
    '/brand/zoey-neutral.png',
    '/brand/zoey-corgi.svg',
  ])('fallback asset %s exists', (assetPath) => {
    expect(existsSync(resolve(publicDir, `.${assetPath}`))).toBe(true);
  });
});

describe('Auth pages reference zoey-neutral.png correctly', () => {
  it.each([
    ['login', '../../app/auth/login/page.tsx'],
    ['register', '../../app/auth/register/page.tsx'],
  ])('%s page imports ZoeyImage and uses zoey-neutral.png', (_name, modulePath) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(path.resolve(__dirname, modulePath), 'utf8');
    expect(source).toContain("import ZoeyImage from");
    expect(source).toContain('src="/brand/zoey-neutral.png"');
  });

  it('zoey-neutral.png exists and is a valid PNG', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    const filePath = resolve(publicDir, 'brand/zoey-neutral.png');
    expect(existsSync(filePath)).toBe(true);
    const header = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, header, 0, 8, 0);
    fs.closeSync(fd);
    // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    expect(header[0]).toBe(0x89);
    expect(header[1]).toBe(0x50);
    expect(header[2]).toBe(0x4E);
    expect(header[3]).toBe(0x47);
  });
});

describe('All Zoey images referenced in login + WelcomeScreen + ZoeyGuideCard exist', () => {
  it.each([
    '/brand/zoey-hero-wide.png',
    '/brand/zoey-celebrate.png',
    '/brand/zoey-neutral.png',
    '/brand/zoey-pointing.png',
    '/brand/zoey-corgi.svg',
    '/brand/zoey-embarrassed.png',
  ])('%s exists on disk', (assetPath) => {
    expect(existsSync(resolve(publicDir, `.${assetPath}`))).toBe(true);
  });
});
