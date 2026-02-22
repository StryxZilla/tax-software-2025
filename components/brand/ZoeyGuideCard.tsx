import React from 'react'

type ZoeyGuideVariant = 'tip' | 'warning' | 'success'

interface ZoeyGuideCardProps {
  variant?: ZoeyGuideVariant
  title: string
  message: string
  className?: string
}

const variantStyles: Record<ZoeyGuideVariant, { badge: string; border: string; bg: string; emoji: string }> = {
  tip: {
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    border: 'border-sky-200',
    bg: 'from-sky-50 to-white',
    emoji: '🧠',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    border: 'border-amber-200',
    bg: 'from-amber-50 to-white',
    emoji: '⚠️',
  },
  success: {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    border: 'border-emerald-200',
    bg: 'from-emerald-50 to-white',
    emoji: '✅',
  },
}

export default function ZoeyGuideCard({ variant = 'tip', title, message, className = '' }: ZoeyGuideCardProps) {
  const style = variantStyles[variant]

  return (
    <div
      className={`rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} p-4 shadow-sm ${className}`}
      role="note"
      aria-label="Zoey guidance"
    >
      <div className="flex items-start gap-3">
        <img
          src="/brand/zoey-corgi.svg"
          alt="Zoey the corgi guide"
          className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 bg-white p-1"
        />
        <div className="min-w-0">
          <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${style.badge}`}>
            <span>{style.emoji}</span>
            <span>Zoey says</span>
          </div>
          <h3 className="mt-2 text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  )
}
