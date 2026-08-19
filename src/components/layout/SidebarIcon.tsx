"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarIcon({
  icon: Icon,
  index = 0,
  className,
}: {
  icon: LucideIcon;
  index?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    wrapRef.current
      ?.querySelectorAll("path, circle, line, polyline, rect, ellipse")
      .forEach((el) => el.setAttribute("pathLength", "1"));
  });

  return (
    <motion.span
      ref={wrapRef}
      className={cn("sidebar-icon pointer-events-none inline-flex items-center justify-center", className)}
      initial={{ opacity: 0, scale: 0.55, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: 0.028 * index,
        type: "spring",
        stiffness: 620,
        damping: 20,
        mass: 0.5,
      }}
    >
      <Icon strokeWidth={1.75} />
    </motion.span>
  );
}
