"use client";

import { useEffect, useId, useRef } from "react";
import { motion } from "framer-motion";
import {
  actionDuration,
  blinkDuration,
  blinkLids,
  breathScale,
  eyeSquint,
  glanceFromSeed,
  getOrbMorph,
  getOrbPalette,
  hopLookOffset,
  hopOffset,
  hopPeakForState,
  hopSquash,
  idleBob,
  idleDrift,
  idleTilt,
  leanFromLook,
  lookRotate,
  lookSweepOffset,
  mapPointerToEyeOffset,
  pickBlinkKind,
  pickIdleAction,
  shouldSaccade,
  smileEyeScale,
  spinAngle,
  springStep,
  squishScale,
  stretchScale,
  wiggleTilt,
  type BlinkKind,
  type IdleAction,
  type OrbState,
  type OrbTone,
} from "@/lib/orb";
import { cn } from "@/lib/cn";

type OrbProps = {
  size?: number;
  state?: OrbState;
  tone?: OrbTone;
  trackPointer?: boolean;
  flourish?: boolean;
  playful?: boolean;
  hop?: boolean;
  className?: string;
  label?: string;
};

export function Orb({
  size = 48,
  state = "idle",
  tone,
  trackPointer = true,
  flourish = false,
  playful = false,
  hop = false,
  className,
  label = "Orb",
}: OrbProps) {
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<SVGGElement>(null);
  const faceRef = useRef<SVGGElement>(null);
  const leftEyeRef = useRef<SVGRectElement>(null);
  const rightEyeRef = useRef<SVGRectElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const flourishRef = useRef<SVGGElement>(null);
  const morph = getOrbMorph(state);
  const palette = getOrbPalette(tone ?? "paper");
  const bodyFill = tone ? palette.body : "var(--orb-body)";
  const eyeFill = tone ? palette.eye : "var(--orb-eye)";
  const morphRef = useRef(morph);
  const stateRef = useRef(state);
  const playfulRef = useRef(playful);
  const hopRef = useRef(hop);
  const trackRef = useRef(trackPointer);
  morphRef.current = morph;
  stateRef.current = state;
  playfulRef.current = playful;
  hopRef.current = hop;
  trackRef.current = trackPointer;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let raf = 0;
    let lastNow = performance.now();
    let lookX = 0;
    let lookY = 0;
    let lookVX = 0;
    let lookVY = 0;
    let followX = 0;
    let followY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let lastPointerX = typeof window !== "undefined" ? window.innerWidth / 2 : 0;
    let lastPointerY = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
    let lastPointerAt = 0;
    let saccadeAt = 0;
    let eyeW = morphRef.current.eyeW;
    let eyeH = morphRef.current.eyeH;
    let eyeY = morphRef.current.eyeY;
    let eyeGap = morphRef.current.eyeGap;
    let eyeRot = morphRef.current.eyeRotate;
    let vW = 0;
    let vH = 0;
    let vY = 0;
    let vGap = 0;
    let vRot = 0;
    let blinkStart = 0;
    let blinkDur = 0;
    let blinkKind: BlinkKind = "single";
    let nextBlink = performance.now() + 1600 + Math.random() * 1800;
    let action: IdleAction | null = null;
    let actionStart = 0;
    let actionDur = 0;
    let nextAction = hopRef.current ? performance.now() + 1200 + Math.random() * 1600 : 1e12;
    let glanceX = 0;
    let glanceY = 0;
    let glanceUntil = 0;
    let nextGlance = performance.now() + 1400 + Math.random() * 1600;
    let glanceSeed = 3;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const readOrigin = () => {
      const rect = root.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };

    const applyTargetFromClient = (clientX: number, clientY: number) => {
      lastPointerX = clientX;
      lastPointerY = clientY;
      lastPointerAt = performance.now();
      const origin = readOrigin();
      const offset = mapPointerToEyeOffset(clientX, clientY, origin.x, origin.y, 4.6);
      pointerX = offset.x;
      pointerY = offset.y;
    };

    const startAction = (now: number, kind: IdleAction) => {
      action = kind;
      actionStart = now;
      actionDur = actionDuration(kind);
      if (kind === "hop" || kind === "squish" || kind === "smile") {
        if (blinkDur === 0) startBlink(now, kind === "smile" ? "slow" : "single");
      }
    };

    const startBlink = (now: number, kind: BlinkKind) => {
      blinkKind = kind;
      blinkDur = blinkDuration(kind);
      blinkStart = now;
      nextBlink = now + blinkDur + 2100 + Math.random() * 3200;
    };

    const onPointerMove = (event: PointerEvent) => {
      applyTargetFromClient(event.clientX, event.clientY);
    };

    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0];
      if (touch) applyTargetFromClient(touch.clientX, touch.clientY);
    };

    const paintEye = (
      node: SVGRectElement | null,
      x: number,
      y: number,
      w: number,
      h: number,
      rot: number,
    ) => {
      if (!node) return;
      const height = Math.max(1.2, h);
      const width = Math.max(1.2, w);
      node.setAttribute(
        "transform",
        `translate(${x} ${y}) rotate(${rot}) translate(${-width / 2} ${-height / 2})`,
      );
      node.setAttribute("width", String(width));
      node.setAttribute("height", String(height));
      node.setAttribute("rx", String(Math.min(width, height) / 2));
    };

    const tick = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      const morphNow = morphRef.current;
      const stateNow = stateRef.current;
      const playfulNow = playfulRef.current;
      const hopNow = hopRef.current;
      const tracking = trackRef.current || playfulNow;

      if (hopNow && !reduced && actionDur === 0 && now >= nextAction) {
        startAction(now, pickIdleAction(Math.random()));
      }

      let actionProgress = 0;
      if (actionDur > 0) {
        actionProgress = (now - actionStart) / actionDur;
        if (actionProgress >= 1) {
          actionProgress = 0;
          actionDur = 0;
          action = null;
          if (hopNow && !reduced) {
            nextAction = now + 1600 + Math.random() * 2000;
          }
        }
      }

      const kind = actionDur > 0 ? action : null;
      const hopProgress = kind === "hop" ? actionProgress : 0;

      if (playfulNow && now > nextGlance && kind !== "look") {
        glanceSeed += 1 + Math.floor(Math.random() * 3);
        const glance = glanceFromSeed(glanceSeed, 3.8);
        glanceX = glance.x;
        glanceY = glance.y;
        glanceUntil = now + 520 + Math.random() * 640;
        nextGlance = glanceUntil + 1600 + Math.random() * 2400;
        if (Math.random() < 0.45 && blinkDur === 0) startBlink(now, "single");
      }
      if (now > glanceUntil) {
        glanceX = 0;
        glanceY = 0;
      }

      if (now > nextBlink && blinkDur === 0) {
        startBlink(now, pickBlinkKind(Math.random()));
      }
      let lids = { left: 1, right: 1 };
      if (blinkDur > 0) {
        const blinkP = (now - blinkStart) / blinkDur;
        if (blinkP >= 1) blinkDur = 0;
        else lids = blinkLids(blinkKind, blinkP);
      }

      const pointerStale = now - lastPointerAt > 1800;
      const drift = tracking ? idleDrift(now) : { x: 0, y: 0 };
      const hopLookRaw = hopProgress > 0 ? hopLookOffset(hopProgress) : { x: 0, y: 0 };
      const hopLook = { x: hopLookRaw.x * 0.45, y: hopLookRaw.y * 0.45 };
      const sweep = kind === "look" ? lookSweepOffset(actionProgress) : { x: 0, y: 0 };
      const desiredX = !tracking
        ? hopLook.x + sweep.x
        : (pointerStale ? glanceX + drift.x + sweep.x : pointerX + glanceX * 0.28 + drift.x * 0.45 + sweep.x * 0.7) +
          hopLook.x;
      const desiredY = !tracking
        ? hopLook.y + sweep.y
        : (pointerStale ? glanceY + drift.y + sweep.y : pointerY + glanceY * 0.28 + drift.y * 0.45 + sweep.y * 0.7) +
          hopLook.y;

      if (shouldSaccade({ x: followX, y: followY }, { x: desiredX, y: desiredY })) {
        if (saccadeAt === 0) saccadeAt = now + 40 + Math.random() * 30;
        if (now >= saccadeAt) {
          followX = desiredX;
          followY = desiredY;
          saccadeAt = 0;
        }
      } else {
        followX = desiredX;
        followY = desiredY;
        saccadeAt = 0;
      }

      const sprungX = springStep(lookX, lookVX, followX, dt, 128, 24);
      const sprungY = springStep(lookY, lookVY, followY, dt, 128, 24);
      lookX = sprungX.value;
      lookVX = sprungX.velocity;
      lookY = sprungY.value;
      lookVY = sprungY.velocity;

      const sW = springStep(eyeW, vW, morphNow.eyeW, dt, 90, 20);
      const sH = springStep(eyeH, vH, morphNow.eyeH, dt, 90, 20);
      const sY = springStep(eyeY, vY, morphNow.eyeY, dt, 90, 20);
      const sG = springStep(eyeGap, vGap, morphNow.eyeGap, dt, 90, 20);
      const sR = springStep(eyeRot, vRot, morphNow.eyeRotate, dt, 70, 18);
      eyeW = sW.value;
      vW = sW.velocity;
      eyeH = sH.value;
      vH = sH.velocity;
      eyeY = sY.value;
      vY = sY.velocity;
      eyeGap = sG.value;
      vGap = sG.velocity;
      eyeRot = sR.value;
      vRot = sR.velocity;

      const motionOff = reduced ? 0 : 1;
      const breath = 1 + (breathScale(now) - 1) * motionOff;
      const bob = playfulNow && !reduced ? idleBob(now) : 0;
      const tilt = playfulNow && !reduced ? idleTilt(now) : 0;
      const wiggle = kind === "wiggle" && !reduced ? wiggleTilt(actionProgress) : 0;
      const spin = kind === "spin" && !reduced ? spinAngle(actionProgress) : 0;
      const lean = tracking && !reduced ? leanFromLook(lookX) : 0;
      let squash = { sx: 1, sy: 1 };
      if (!reduced) {
        if (kind === "hop") squash = hopSquash(hopProgress);
        else if (kind === "squish") squash = squishScale(actionProgress);
        else if (kind === "stretch") squash = stretchScale(actionProgress);
      }
      const jump = reduced ? 0 : hopOffset(hopProgress, hopPeakForState(stateNow));
      const sx = breath * squash.sx;
      const sy = breath * squash.sy;
      const faceRot = tilt + wiggle + lean;

      moverRef.current?.setAttribute(
        "transform",
        `translate(50 ${50 + jump + bob}) rotate(${spin}) translate(-50 -50)`,
      );
      faceRef.current?.setAttribute(
        "transform",
        `translate(50 50) rotate(${faceRot}) scale(${sx} ${sy})`,
      );

      const land = 1 - Math.min(1, Math.abs(jump) / 18);
      if (shadowRef.current) {
        shadowRef.current.setAttribute("rx", String(16 + 8 * land));
        shadowRef.current.setAttribute("ry", String(2.2 * land + 0.6));
        shadowRef.current.setAttribute("opacity", String(0.16 * land));
      }

      if (flourishRef.current) {
        if (actionDur > 0 && kind) {
          const p = actionProgress;
          const fOpacity = Math.min(1, Math.sin(p * Math.PI) * 1.5);
          const fScale = 0.72 + 0.48 * Math.sin(p * Math.PI);
          const fRot = p * (kind === "spin" ? 360 : kind === "hop" ? 140 : 80);
          flourishRef.current.style.opacity = String(fOpacity);
          flourishRef.current.setAttribute(
            "transform",
            `translate(50 50) rotate(${fRot}) scale(${fScale}) translate(-50 -50)`,
          );
        } else {
          flourishRef.current.style.opacity = "0";
        }
      }

      const hopSquint = hopProgress > 0 ? eyeSquint(hopProgress) : 1;
      const smile = kind === "smile" ? smileEyeScale(actionProgress) : 1;
      const squint = hopSquint * smile;
      const rot = lookRotate(lookX, lookY, eyeRot);
      const leftH = eyeH * lids.left * squint;
      const rightH = eyeH * lids.right * squint;
      const leftW = eyeW * (1 + (1 - lids.left) * 0.28);
      const rightW = eyeW * (1 + (1 - lids.right) * 0.28);
      paintEye(leftEyeRef.current, -eyeGap + lookX, eyeY + lookY, leftW, leftH, rot);
      paintEye(rightEyeRef.current, eyeGap + lookX, eyeY + lookY, rightW, rightH, rot);

      raf = requestAnimationFrame(tick);
    };

    if (trackPointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("touchstart", onTouch, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchend", onTouch, { passive: true });
      applyTargetFromClient(lastPointerX, lastPointerY);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouch);
    };
  }, [trackPointer]);

  return (
    <motion.div
      ref={rootRef}
      className={cn("relative inline-flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
      aria-label={label}
      role="img"
    >
      <motion.svg
        viewBox={flourish ? "-22 -28 144 150" : playful ? "0 -8 100 116" : "0 0 100 100"}
        width={flourish ? size * 1.32 : size}
        height={flourish ? size * 1.32 : size}
        overflow="visible"
      >
        <defs>
          <linearGradient id={`t1-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id={`t2-${uid}`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id={`t3-${uid}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>

        {playful && !flourish ? (
          <ellipse ref={shadowRef} cx="50" cy="98" rx="22" ry="2.6" fill="#000" opacity="0.08" />
        ) : null}

        <g ref={moverRef}>
        {flourish ? (
          <g
            ref={flourishRef}
            fill="none"
            strokeLinecap="round"
            style={{ transformOrigin: "50px 50px", opacity: 0 }}
          >
            <path
              d="M62 8 C78 -6, 96 4, 90 22"
              stroke={`url(#t1-${uid})`}
              strokeWidth="3.4"
            />
            <path
              d="M86 28 C104 22, 112 44, 98 52"
              stroke={`url(#t2-${uid})`}
              strokeWidth="3.2"
            />
            <path
              d="M78 78 C92 92, 74 108, 60 96"
              stroke={`url(#t3-${uid})`}
              strokeWidth="3.4"
            />
            <path
              d="M22 86 C8 98, 18 112, 34 102"
              stroke={`url(#t1-${uid})`}
              strokeWidth="2.8"
            />
            <path
              d="M18 28 C4 18, 8 4, 24 12"
              stroke={`url(#t2-${uid})`}
              strokeWidth="2.6"
            />
            <circle cx="108" cy="48" r="2.4" fill="#fbbf24" />
            <circle cx="6" cy="62" r="2.0" fill="#a78bfa" />
            <circle cx="18" cy="16" r="1.8" fill="#38bdf8" />
            <circle cx="92" cy="96" r="2.0" fill="#34d399" />
          </g>
        ) : null}

        <g ref={faceRef} style={{ transformOrigin: "50px 50px" }}>
          <motion.ellipse
            cx="0"
            cy="0"
            fill={bodyFill}
            animate={{ rx: morph.bodyRx, ry: morph.bodyRy }}
            transition={{ type: "spring", stiffness: 170, damping: 18 }}
          />
          <rect
            ref={leftEyeRef}
            x="0"
            y="0"
            width={morph.eyeW}
            height={morph.eyeH}
            rx={Math.min(morph.eyeW, morph.eyeH) / 2}
            fill={eyeFill}
          />
          <rect
            ref={rightEyeRef}
            x="0"
            y="0"
            width={morph.eyeW}
            height={morph.eyeH}
            rx={Math.min(morph.eyeW, morph.eyeH) / 2}
            fill={eyeFill}
          />
        </g>
        </g>
      </motion.svg>
    </motion.div>
  );
}
