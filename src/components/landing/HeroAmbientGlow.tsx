"use client";

import { motion } from "framer-motion";

export function HeroAmbientGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Blob 1 - Warm Amber / Gold */}
      <motion.div
        className="absolute -top-16 left-4 h-72 w-72 rounded-full bg-gradient-to-br from-amber-400/25 via-amber-500/15 to-transparent blur-[85px] dark:from-amber-400/20 dark:via-amber-500/10"
        animate={{
          x: [0, 45, -25, 0],
          y: [0, 30, -20, 0],
          scale: [0.85, 1.15, 0.9, 0.85],
          opacity: [0.35, 0.85, 0.4, 0.35],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 2 - Violet / Purple (Centers behind title/intro) */}
      <motion.div
        className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-violet-500/25 via-purple-400/20 to-transparent blur-[95px] dark:from-violet-500/25 dark:via-purple-500/15"
        animate={{
          x: [0, -40, 35, 0],
          y: [0, 40, 15, 0],
          scale: [0.9, 1.25, 0.95, 0.9],
          opacity: [0.2, 0.9, 0.3, 0.2],
        }}
        transition={{
          duration: 18,
          delay: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 3 - Cyan / Sky Blue */}
      <motion.div
        className="absolute -top-10 left-1/2 h-88 w-88 rounded-full bg-gradient-to-bl from-sky-400/25 via-cyan-400/15 to-transparent blur-[90px] dark:from-sky-400/20 dark:via-cyan-500/10"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -35, 25, 0],
          scale: [1, 0.8, 1.2, 1],
          opacity: [0.4, 0.2, 0.85, 0.4],
        }}
        transition={{
          duration: 16,
          delay: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 4 - Emerald / Mint Soft Accent */}
      <motion.div
        className="absolute top-44 left-16 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-400/20 via-teal-400/15 to-transparent blur-[80px] dark:from-emerald-400/15 dark:via-teal-500/10"
        animate={{
          x: [0, -30, 40, 0],
          y: [0, -25, 30, 0],
          scale: [0.8, 1.1, 0.85, 0.8],
          opacity: [0.15, 0.75, 0.25, 0.15],
        }}
        transition={{
          duration: 20,
          delay: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 5 - Rose / Coral Accent */}
      <motion.div
        className="absolute top-28 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-rose-400/20 via-pink-400/15 to-transparent blur-[85px] dark:from-rose-500/20 dark:via-pink-500/10"
        animate={{
          x: [0, 35, -35, 0],
          y: [0, 30, -30, 0],
          scale: [0.9, 1.2, 0.85, 0.9],
          opacity: [0.25, 0.8, 0.15, 0.25],
        }}
        transition={{
          duration: 15,
          delay: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle floating ambient micro-lights / sparkles */}
      <motion.div
        className="absolute top-16 left-[18%] h-2.5 w-2.5 rounded-full bg-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
        animate={{
          y: [0, -18, 0],
          opacity: [0, 0.85, 0],
          scale: [0.6, 1.2, 0.6],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-36 left-[34%] h-2 w-2 rounded-full bg-violet-400/70 shadow-[0_0_10px_rgba(167,139,250,0.8)]"
        animate={{
          y: [0, -14, 0],
          opacity: [0, 0.9, 0],
          scale: [0.5, 1.3, 0.5],
        }}
        transition={{
          duration: 6.2,
          delay: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-20 left-[48%] h-2.5 w-2.5 rounded-full bg-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
        animate={{
          y: [0, -20, 0],
          opacity: [0, 0.8, 0],
          scale: [0.6, 1.2, 0.6],
        }}
        transition={{
          duration: 5.6,
          delay: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
