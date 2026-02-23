'use client';

import React, { useState, useCallback } from 'react';

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
 * Handles basePath/CDN/asset-path mismatches gracefully.
 */
export default function ZoeyImage({
  src,
  alt,
  fallbackText = '🐕',
  className = '',
  'data-testid': testId,
  ...rest
}: ZoeyImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failedSrcs, setFailedSrcs] = useState<Set<string>>(new Set());
  const [allFailed, setAllFailed] = useState(false);

  const handleError = useCallback(() => {
    setFailedSrcs((prev) => {
      const next = new Set(prev);
      next.add(currentSrc);

      // Find the next fallback that hasn't failed and isn't the current src
      const nextFallback = FALLBACK_CHAIN.find(
        (fb) => !next.has(fb) && fb !== src,
      );

      if (nextFallback) {
        setCurrentSrc(nextFallback);
      } else {
        setAllFailed(true);
      }

      return next;
    });
  }, [currentSrc, src]);

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
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      data-testid={testId}
    />
  );
}
