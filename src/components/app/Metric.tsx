import { Money } from "@/components/ui/Money";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Metric({
  label,
  value,
  hint,
  plain,
  className,
}: {
  label: string;
  value: number;
  hint?: string;
  plain?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {plain ? value : <Money value={value} />}
      </p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}
