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
});

describe('ZoeyImage fallback assets exist on disk', () => {
  it.each([
    '/brand/zoey-neutral.png',
    '/brand/zoey-corgi.svg',
  ])('fallback asset %s exists', (assetPath) => {
    expect(existsSync(resolve(publicDir, `.${assetPath}`))).toBe(true);
  });
});

describe('All Zoey images referenced in WelcomeScreen + ZoeyGuideCard exist', () => {
  it.each([
    '/brand/zoey-hero-wide.png',
    '/brand/zoey-celebrate.png',
    '/brand/zoey-neutral.png',
    '/brand/zoey-pointing.png',
    '/brand/zoey-corgi.svg',
  ])('%s exists on disk', (assetPath) => {
    expect(existsSync(resolve(publicDir, `.${assetPath}`))).toBe(true);
  });
});
