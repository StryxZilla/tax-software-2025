'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

/** All known Zoey image paths — used for fallback chain */
const FALLBACK_CHAIN = [
  '/brand/zoey-neutral.png',
  '/brand/zoey-corgi.svg',
] as const;

interface ZoeyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Primary image path (e.g. "/brand/zoey-hero-wide.png") */
  src: string;
  /** Alt text — required for accessibility */
  alt: string;
  /** Text to show if all images fail to load */
  fallbackText?: string;
  /** data-testid for testing */
  'data-testid'?: string;
}

/**
 * Resilient Zoey image component with automatic fallback chain.
 *
 * If the primary src fails to load, it tries known fallback images
 * in order. If all images fail, it renders a text avatar.
 *
 * Handles basePath/CDN/asset-path mismatches gracefully, including
 * images that error before React hydration completes.
 */
export default function ZoeyImage({
  src,
  alt,
  fallbackText = '🐕',
  className = '',
  'data-testid': testId,
  ...rest
}: ZoeyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set());
  const [allFailed, setAllFailed] = useState(false);

  // Reset state when the src prop changes (e.g. parent re-render)
  useEffect(() => {
    setCurrentSrc(src);
    setFailedSrcs(new Set());
    setAllFailed(false);
  }, [src]);

  const advanceFallback = useCallback(
    (failedSrc: string) => {
      setFailedSrcs((prev) => {
        const next = new Set(prev);
        next.add(failedSrc);

        // Build the full candidate list: original src first, then the chain
        const candidates = [src, ...FALLBACK_CHAIN];
        const nextCandidate = candidates.find((c) => !next.has(c));

        if (nextCandidate) {
          setCurrentSrc(nextCandidate);
        } else {
          setAllFailed(true);
        }

        return next;
      });
    },
    [src],
  );

  const handleError = useCallback(() => {
    advanceFallback(currentSrc);
  }, [advanceFallback, currentSrc]);

  // Detect images that errored before React hydration (SSR race condition).
  // An <img> with complete=true and naturalWidth=0 means the browser already
  // tried and failed to load it before our onError handler was attached.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0 && !allFailed) {
      advanceFallback(currentSrc);
    }
  }); // intentionally no deps — check on every render

  if (allFailed) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={`inline-flex items-center justify-center bg-amber-100 text-amber-700 font-bold select-none ${className}`}
        data-testid={testId}
      >
        {fallbackText}
      </span>
    );
  }

  return (
    <img
      {...rest}
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      data-testid={testId}
    />
  );
}
