import { cn } from "@/lib/cn";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <div className={cn("landing-rise", className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

export function RevealLine({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={cn("landing-line", className)}>
      <span style={{ animationDelay: `${delay}s` }}>{children}</span>
    </span>
  );
}

export function RevealOnScroll({ children, className }: RevealProps) {
  return <div className={cn("landing-scroll", className)}>{children}</div>;
}

export function LandingCurtain() {
  return <div className="landing-veil" aria-hidden />;
}
