import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-xs font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background shadow-2xs hover:opacity-90 active:opacity-100",
        primary: "bg-foreground text-background shadow-2xs hover:opacity-90 active:opacity-100",
        outline:
          "border-line bg-surface/50 text-ink hover:bg-surface hover:border-foreground/20 hover:text-ink aria-expanded:bg-surface dark:bg-surface/30",
        secondary:
          "border border-line bg-surface/40 text-ink hover:bg-surface hover:text-ink hover:border-foreground/20 aria-expanded:bg-surface",
        ghost:
          "hover:bg-foreground/[0.05] text-secondary hover:text-ink aria-expanded:bg-foreground/[0.05]",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 focus-visible:ring-destructive/30",
        danger:
          "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 focus-visible:ring-destructive/30",
        link: "text-ink underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8.5 gap-2 px-3 text-xs",
        md: "h-8.5 gap-2 px-3 text-xs",
        xs: "h-6.5 gap-1 rounded-lg px-2 text-[11px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7.5 gap-1.5 rounded-lg px-2.5 text-[11.5px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 rounded-xl px-4 text-sm font-semibold",
        icon: "size-8.5 rounded-xl",
        "icon-xs":
          "size-6.5 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7.5 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
