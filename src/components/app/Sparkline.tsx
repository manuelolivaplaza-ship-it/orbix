import { formatCLP } from "@/lib/format";

export function Sparkline({
  points,
  className,
}: {
  points: Array<{ label: string; balance: number }>;
  className?: string;
}) {
  if (points.length < 2) return null;
  const values = points.map((p) => p.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 640;
  const h = 180;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p.balance - min) / span) * (h - 16) - 8;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const last = points[points.length - 1];

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" aria-hidden>
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
      </svg>
      <p className="text-xs text-muted-foreground">
        Proyección {last?.label}: {formatCLP(last?.balance ?? 0)}
      </p>
    </div>
  );
}
