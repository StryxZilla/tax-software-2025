'use client';

import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface SaveStatusIndicatorProps {
  lastSaved: Date | null;
  isCalculating?: boolean;
}

export default function SaveStatusIndicator({ lastSaved, isCalculating }: SaveStatusIndicatorProps) {
  if (isCalculating) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600" data-testid="save-status">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Saving…</span>
      </div>
    );
  }

  if (!lastSaved) return null;

  const formatTime = (d: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 60_000) return 'just now';
    if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-green-600" data-testid="save-status">
      <Check className="w-3 h-3" />
      <span>Saved {formatTime(lastSaved)}</span>
    </div>
  );
}
