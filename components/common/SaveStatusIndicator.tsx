'use client';

import React, { useState } from 'react';
import { Check, Loader2, Save } from 'lucide-react';

interface SaveStatusIndicatorProps {
  lastSaved: Date | null;
  isCalculating?: boolean;
  onSave?: () => Promise<void>;
}

export default function SaveStatusIndicator({ lastSaved, isCalculating, onSave }: SaveStatusIndicatorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave || isSaving) return;
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (d: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 60_000) return 'just now';
    if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const showSpinner = isCalculating || isSaving;

  return (
    <div className="flex items-center gap-2" data-testid="save-status">
      {/* Explicit Save button */}
      <button
        onClick={handleSave}
        disabled={showSpinner || !onSave}
        data-testid="save-button"
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
          transition-colors duration-150
          ${showSpinner
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
          }
        `}
      >
        {showSpinner ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        {isSaving ? 'Saving…' : 'Save'}
      </button>

      {/* Status text */}
      {lastSaved && !showSpinner && (
        <span className="text-xs text-green-600 flex items-center gap-1">
          <Check className="w-3 h-3" />
          Saved {formatTime(lastSaved)}
        </span>
      )}
    </div>
  );
}
