"use client";

import { useEffect, useRef } from "react";
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
  flourishEnvelope,
  flourishShouldShow,
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
  shadow?: boolean;
  hop?: boolean;
  intro?: boolean;
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
  shadow = false,
  hop = false,
  intro = false,
  className,
  label = "Orb",
}: OrbProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const morph = getOrbMorph(state);
  const palette = getOrbPalette(tone ?? "paper");
  const bodyFill = tone ? palette.body : "var(--orb-body)";
  const eyeFill = tone ? palette.eye : "var(--orb-eye)";
  const morphRef = useRef(morph);
  const stateRef = useRef(state);
  const playfulRef = useRef(playful);
  const hopRef = useRef(hop);
  const introRef = useRef(intro);
  const trackRef = useRef(trackPointer);
  morphRef.current = morph;
  stateRef.current = state;
  playfulRef.current = playful;
  hopRef.current = hop;
  introRef.current = intro;
  trackRef.current = trackPointer;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let mover: SVGGElement | null = null;
    let face: SVGGElement | null = null;
    let leftEye: SVGRectElement | null = null;
    let rightEye: SVGRectElement | null = null;
    let shadow: SVGEllipseElement | null = null;
    let flourish: SVGGElement | null = null;
    const nodes = () => {
      mover ??= root.querySelector("[data-orb=mover]");
      face ??= root.querySelector("[data-orb=face]");
      leftEye ??= root.querySelector("[data-orb=eye-left]");
      rightEye ??= root.querySelector("[data-orb=eye-right]");
      shadow ??= root.querySelector("[data-orb=shadow]");
      flourish ??= root.querySelector("[data-orb=flourish]");
    };

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
    let didIntroHop = false;
    let nextAction = hopRef.current
      ? performance.now() + (introRef.current ? 720 : 1200) + Math.random() * (introRef.current ? 180 : 1600)
      : 1e12;
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
      nodes();

      if (hopNow && nextAction > 1e11) {
        nextAction = now + (introRef.current ? 720 : 1200);
      }

      if (hopNow && !reduced && actionDur === 0 && now >= nextAction) {
        const forceIntroHop = introRef.current && !didIntroHop;
        didIntroHop = true;
        startAction(now, forceIntroHop ? "hop" : pickIdleAction(Math.random()));
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

      mover?.setAttribute(
        "transform",
        `translate(50 ${50 + jump + bob}) rotate(${spin}) translate(-50 -50)`,
      );
      face?.setAttribute(
        "transform",
        `translate(50 50) rotate(${faceRot}) scale(${sx} ${sy})`,
      );

      const land = 1 - Math.min(1, Math.abs(jump) / 18);
      if (shadow) {
        shadow.setAttribute("rx", String(16 + 8 * land));
        shadow.setAttribute("ry", String(2.2 * land + 0.6));
        shadow.setAttribute("opacity", String(0.16 * land));
      }

      if (flourish) {
        const marks = actionDur > 0 && flourishShouldShow(kind);
        if (!marks || reduced) {
          flourish.style.opacity = "0";
        } else {
          const delay0 = kind === "hop" ? 0.17 : 0.04;
          const base = flourishEnvelope(actionProgress, delay0);
          flourish.style.opacity = "1";
          flourish.setAttribute(
            "transform",
            `translate(50 50) scale(${base.expand}) translate(-50 -50)`,
          );
          flourish.querySelectorAll<SVGPathElement>("[data-flourish=stroke]").forEach((node) => {
            const i = Number(node.dataset.i ?? 0);
            const env = flourishEnvelope(actionProgress, delay0 + i * 0.038);
            node.style.opacity = String(env.opacity);
            node.style.strokeDasharray = "1";
            node.style.strokeDashoffset = String(env.draw);
          });
          flourish.querySelectorAll<SVGGElement>("[data-flourish=star]").forEach((node) => {
            const i = Number(node.dataset.i ?? 0);
            const cx = Number(node.dataset.cx ?? 0);
            const cy = Number(node.dataset.cy ?? 0);
            const env = flourishEnvelope(actionProgress, 0.26 + i * 0.055);
            const s = 0.12 + 0.88 * env.opacity;
            node.style.opacity = String(env.opacity);
            node.setAttribute("transform", `translate(${cx} ${cy}) scale(${s})`);
          });
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
      paintEye(leftEye, -eyeGap + lookX, eyeY + lookY, leftW, leftH, rot);
      paintEye(rightEye, eyeGap + lookX, eyeY + lookY, rightW, rightH, rot);

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
    <div
      ref={rootRef}
      className={cn("relative inline-flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
      aria-label={label}
      role="img"
    >
      <svg
        viewBox={flourish ? "-30 -36 160 172" : playful ? "0 -8 100 116" : "0 0 100 100"}
        width={flourish ? size * 1.38 : size}
        height={flourish ? size * 1.38 : size}
        overflow="visible"
      >
        {shadow && !flourish ? (
          <ellipse data-orb="shadow" cx="50" cy="98" rx="22" ry="2.6" fill="#000" opacity="0.08" />
        ) : null}

        <g data-orb="mover">
        {flourish ? (
          <g
            data-orb="flourish"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transformOrigin: "50px 50px", opacity: 0 }}
          >
            <path
              data-flourish="stroke"
              data-i="0"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              d="M66 6 C78 -8, 102 0, 98 18 C94 30, 76 24, 82 12 C86 4, 98 10, 92 18"
              stroke="#f59e0b"
              strokeWidth="4.2"
            />
            <path
              data-flourish="stroke"
              data-i="1"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              d="M92 30 C110 20, 122 42, 108 56 C98 66, 90 52, 98 44 C106 36, 114 44, 106 50"
              stroke="#a78bfa"
              strokeWidth="4"
            />
            <path
              data-flourish="stroke"
              data-i="2"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              d="M78 76 C96 88, 92 110, 70 104 C58 100, 70 88, 82 90"
              stroke="#38bdf8"
              strokeWidth="3.8"
            />
            <path
              data-flourish="stroke"
              data-i="3"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              d="M24 82 C6 94, 8 116, 30 108 C42 102, 28 92, 22 96"
              stroke="#34d399"
              strokeWidth="3.8"
            />
            <path
              data-flourish="stroke"
              data-i="4"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              d="M20 24 C4 10, 6 -8, 26 4 C38 12, 18 16, 16 8"
              stroke="#fb7185"
              strokeWidth="3.6"
            />
            <g data-flourish="star" data-i="0" data-cx="112" data-cy="18" opacity="0">
              <path
                fill="#fbbf24"
                d="M0-5.4 1.5-.2 6.8 0 2.6 3.1 4 8 0 5.2-4 8-2.6 3.1-6.8 0-1.5-.2Z"
              />
            </g>
            <g data-flourish="star" data-i="1" data-cx="6" data-cy="52" opacity="0">
              <path
                fill="#a78bfa"
                d="M0-4.2 1.2-.1 5.2 0 2 2.4 3.1 6.2 0 4-3.1 6.2-2 2.4-5.2 0-1.2-.1Z"
              />
            </g>
            <g data-flourish="star" data-i="2" data-cx="90" data-cy="102" opacity="0">
              <path
                fill="#34d399"
                d="M0-3.6 1-.1 4.4 0 1.7 2 2.6 5.2 0 3.4-2.6 5.2-1.7 2-4.4 0-1-.1Z"
              />
            </g>
          </g>
        ) : null}

        <g data-orb="face" style={{ transformOrigin: "50px 50px" }} transform="translate(50 50)">
          <ellipse
            cx="0"
            cy="0"
            rx={morph.bodyRx}
            ry={morph.bodyRy}
            fill={bodyFill}
          />
          <rect
            data-orb="eye-left"
            x="0"
            y="0"
            width={morph.eyeW}
            height={morph.eyeH}
            rx={Math.min(morph.eyeW, morph.eyeH) / 2}
            fill={eyeFill}
          />
          <rect
            data-orb="eye-right"
            x="0"
            y="0"
            width={morph.eyeW}
            height={morph.eyeH}
            rx={Math.min(morph.eyeW, morph.eyeH) / 2}
            fill={eyeFill}
          />
        </g>
        </g>
      </svg>
    </div>
  );
}
