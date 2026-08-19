import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background shadow-2xs",
        secondary:
          "bg-foreground/[0.06] text-secondary border border-line",
        destructive:
          "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
        outline:
          "border-line text-ink hover:bg-surface",
        ghost:
          "hover:bg-foreground/[0.05] text-muted hover:text-ink",
        link: "text-ink underline-offset-4 hover:underline",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        info: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
        muted: "bg-foreground/[0.04] text-muted border border-line",
        accent: "bg-foreground text-background",
        danger: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const TONE: Record<string, NonNullable<VariantProps<typeof badgeVariants>["variant"]>> = {
  default: "secondary",
  accent: "accent",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  muted: "muted",
}

function Badge({
  className,
  variant,
  tone,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    tone?: keyof typeof TONE
  }) {
  const Comp = asChild ? Slot.Root : "span"
  const resolved = variant ?? (tone ? TONE[tone] : "secondary")

  return (
    <Comp
      data-slot="badge"
      data-variant={resolved}
      className={cn(badgeVariants({ variant: resolved }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
