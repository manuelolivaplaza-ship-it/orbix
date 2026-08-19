import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown } from "lucide-react";

export { Input, Label, Textarea };

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          "h-9 w-full appearance-none rounded-xl border border-line bg-surface/60 px-3 pr-8 text-sm font-medium text-ink transition-all hover:bg-surface hover:border-foreground/20 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface/40 cursor-pointer shadow-2xs",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-transform"
      />
    </div>
  );
}
