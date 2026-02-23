/**
 * Centralized chart label formatting utilities.
 * Ensures labels never render blank/empty.
 */

/** Fallback label for unnamed chart entries */
export const CHART_LABEL_FALLBACK = 'Other';

/**
 * Ensure a chart label string is never blank.
 * Returns the original label if truthy, otherwise the fallback.
 */
export function safeChartLabel(label: string | undefined | null, fallback = CHART_LABEL_FALLBACK): string {
  return label?.trim() || fallback;
}

/**
 * Format a pie-chart slice label with name + percentage.
 * Guarantees non-empty label via `safeChartLabel`.
 */
export function formatPieSliceLabel({
  name,
  percent,
  fallback = CHART_LABEL_FALLBACK,
}: {
  name?: string | null;
  percent?: number;
  fallback?: string;
}): string {
  const label = safeChartLabel(name, fallback);
  return `${label}: ${((percent || 0) * 100).toFixed(0)}%`;
}
