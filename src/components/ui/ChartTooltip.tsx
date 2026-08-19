"use client";

import { formatCLP } from "@/lib/format";

export function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 text-muted">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="font-mono text-ink">
          <span style={{ color: item.color }}>{item.name}</span> {formatCLP(item.value)}
        </p>
      ))}
    </div>
  );
}
