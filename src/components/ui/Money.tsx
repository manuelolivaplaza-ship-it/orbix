import { formatCLP } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Money({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return <span className={cn("font-mono tabular-nums", className)}>{formatCLP(value)}</span>;
}
