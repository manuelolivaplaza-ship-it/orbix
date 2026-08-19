import { Orb } from "@/components/orb/Orb";
import type { OrbState } from "@/lib/orb";
import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  action,
  state = "idle",
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  state?: OrbState;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-8 py-16 text-center",
        className,
      )}
    >
      <Orb size={72} state={state} playful />
      <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-secondary">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Algo salió mal",
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <EmptyState title={title} description={description} action={action} state="error" />
  );
}

export function SuccessBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground">
      <Orb size={28} state="success" trackPointer={false} />
      <span>{children}</span>
    </div>
  );
}
