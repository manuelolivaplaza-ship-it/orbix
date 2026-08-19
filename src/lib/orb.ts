export type OrbState =
  | "idle"
  | "thinking"
  | "happy"
  | "working"
  | "success"
  | "error";

export type OrbTone = "ink" | "paper";

export type Point = { x: number; y: number };

/** Capsule-eye morph, matching the Grok Bot silhouette (circle + two stadium eyes). */
export type OrbMorph = {
  bodyRx: number;
  bodyRy: number;
  eyeW: number;
  eyeH: number;
  eyeY: number;
  eyeGap: number;
  eyeRotate: number;
  mouth: "none" | "smile" | "line" | "o" | "frown";
  accent: string;
};

export type OrbPalette = {
  body: string;
  eye: string;
};

const MORPHS: Record<OrbState, OrbMorph> = {
  idle: {
    bodyRx: 46,
    bodyRy: 46,
    eyeW: 7.2,
    eyeH: 17.5,
    eyeY: -10,
    eyeGap: 11.5,
    eyeRotate: -8,
    mouth: "none",
    accent: "#ffffff",
  },
  thinking: {
    bodyRx: 48,
    bodyRy: 44,
    eyeW: 6.4,
    eyeH: 15,
    eyeY: -16,
    eyeGap: 10.5,
    eyeRotate: 12,
    mouth: "none",
    accent: "#ffffff",
  },
  happy: {
    bodyRx: 47,
    bodyRy: 45,
    eyeW: 8.2,
    eyeH: 7.2,
    eyeY: -9,
    eyeGap: 12,
    eyeRotate: -14,
    mouth: "smile",
    accent: "#ffffff",
  },
  working: {
    bodyRx: 42,
    bodyRy: 49,
    eyeW: 6.2,
    eyeH: 16.5,
    eyeY: -6,
    eyeGap: 9.2,
    eyeRotate: 0,
    mouth: "none",
    accent: "#ffffff",
  },
  success: {
    bodyRx: 48,
    bodyRy: 44,
    eyeW: 8.4,
    eyeH: 6.6,
    eyeY: -11,
    eyeGap: 12.5,
    eyeRotate: -16,
    mouth: "smile",
    accent: "#16a34a",
  },
  error: {
    bodyRx: 44,
    bodyRy: 48,
    eyeW: 11,
    eyeH: 12,
    eyeY: -6,
    eyeGap: 15,
    eyeRotate: 6,
    mouth: "frown",
    accent: "#dc2626",
  },
};

const INK: OrbPalette = {
  body: "#111111",
  eye: "#f5f5f2",
};

const PAPER: OrbPalette = {
  body: "#ffffff",
  eye: "#111111",
};

export function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export function lerpPoint(current: Point, target: Point, factor: number): Point {
  return {
    x: lerp(current.x, target.x, factor),
    y: lerp(current.y, target.y, factor),
  };
}

export function mapPointerToEyeOffset(
  pointerX: number,
  pointerY: number,
  originX: number,
  originY: number,
  maxOffset: number,
): Point {
  const dx = pointerX - originX;
  const dy = pointerY - originY;
  const dist = Math.hypot(dx, dy);
  if (dist === 0 || maxOffset <= 0) return { x: 0, y: 0 };
  const scale = Math.min(1, maxOffset / dist);
  return { x: dx * scale, y: dy * scale };
}

export function getOrbMorph(state: OrbState): OrbMorph {
  return MORPHS[state];
}

export function getOrbPalette(tone: OrbTone): OrbPalette {
  return tone === "paper" ? PAPER : INK;
}

/** Light surfaces get a black Orb; dark surfaces get a white Orb — same as Grok Bot. */
export function resolveOrbTone(background: "light" | "dark"): OrbTone {
  return background === "dark" ? "paper" : "ink";
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function breathScale(timeMs: number, amplitude = 0.012, periodMs = 3400): number {
  return 1 + Math.sin((timeMs / periodMs) * Math.PI * 2) * amplitude;
}

export type IdleAction = "hop" | "squish" | "wiggle" | "spin" | "stretch" | "look" | "smile";

export function pickIdleAction(rand: number): IdleAction {
  if (rand < 0.28) return "hop";
  if (rand < 0.44) return "spin";
  if (rand < 0.58) return "wiggle";
  if (rand < 0.7) return "look";
  if (rand < 0.8) return "smile";
  if (rand < 0.9) return "squish";
  return "stretch";
}

export function actionDuration(kind: IdleAction): number {
  if (kind === "hop") return 880;
  if (kind === "squish") return 700;
  if (kind === "wiggle") return 860;
  if (kind === "spin") return 980;
  if (kind === "stretch") return 760;
  if (kind === "smile") return 850;
  return 1200;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Crouch, launch, hang, land — not a raw sine pop. */
export function hopOffset(progress: number, peak = 8): number {
  const p = clamp01(progress);
  if (p === 0 || p === 1) return 0;
  if (p < 0.16) {
    const t = p / 0.16;
    return 1.8 * (t * t * (3 - 2 * t));
  }
  if (p < 0.52) {
    const t = (p - 0.16) / 0.36;
    return 1.8 + (-peak - 1.8) * easeOutCubic(t);
  }
  if (p < 0.84) {
    const t = (p - 0.52) / 0.32;
    return -peak + (peak + 1.2) * (t * t);
  }
  const t = (p - 0.84) / 0.16;
  return 1.2 * (1 - t) * (1 - t);
}

/** Crouch wide, stretch in the air, squash on landing. */
export function hopSquash(progress: number): { sx: number; sy: number } {
  const p = clamp01(progress);
  if (p === 0 || p === 1) return { sx: 1, sy: 1 };
  if (p < 0.16) {
    const t = p / 0.16;
    return { sx: 1 + 0.07 * t, sy: 1 - 0.08 * t };
  }
  if (p < 0.5) {
    const t = (p - 0.16) / 0.34;
    return { sx: 1.07 - 0.12 * t, sy: 0.92 + 0.14 * t };
  }
  if (p < 0.78) {
    const t = (p - 0.5) / 0.28;
    return { sx: 0.95 + 0.05 * t, sy: 1.06 - 0.06 * t };
  }
  const squash = Math.sin(((p - 0.78) / 0.22) * Math.PI);
  return { sx: 1 + 0.08 * squash, sy: 1 - 0.09 * squash };
}

export function squishScale(progress: number): { sx: number; sy: number } {
  const p = clamp01(progress);
  if (p === 0 || p === 1) return { sx: 1, sy: 1 };
  if (p < 0.4) {
    const t = p / 0.4;
    const k = t * t * (3 - 2 * t);
    return { sx: 1 + 0.14 * k, sy: 1 - 0.16 * k };
  }
  if (p < 0.52) return { sx: 1.14, sy: 0.84 };
  const t = (p - 0.52) / 0.48;
  const over = Math.sin(t * Math.PI) * 0.05 * (1 - t);
  const k = 1 - (1 - t) ** 3;
  return { sx: 1.14 - 0.14 * k - over, sy: 0.84 + 0.16 * k + over };
}

export function stretchScale(progress: number): { sx: number; sy: number } {
  const p = clamp01(progress);
  if (p === 0 || p === 1) return { sx: 1, sy: 1 };
  const wave = Math.sin(p * Math.PI);
  return { sx: 1 - 0.08 * wave, sy: 1 + 0.12 * wave };
}

export function wiggleTilt(progress: number): number {
  const p = clamp01(progress);
  return Math.sin(p * Math.PI * 4) * 11 * (1 - p * 0.55);
}

export function spinAngle(progress: number): number {
  const p = clamp01(progress);
  const eased = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
  return eased * 360;
}

/** Left, hold, right, hold, center. */
export function lookSweepOffset(progress: number): Point {
  const p = clamp01(progress);
  if (p < 0.2) return { x: -3.6 * (p / 0.2), y: 0.4 };
  if (p < 0.38) return { x: -3.6, y: 0.4 };
  if (p < 0.58) {
    const t = (p - 0.38) / 0.2;
    return { x: -3.6 + 7.4 * t, y: 0.4 - 0.2 * t };
  }
  if (p < 0.78) return { x: 3.8, y: 0.2 };
  const t = (p - 0.78) / 0.22;
  return { x: 3.8 * (1 - t), y: 0.2 * (1 - t) };
}

export function smileEyeScale(progress: number): number {
  const p = clamp01(progress);
  if (p === 0 || p === 1) return 1;
  if (p < 0.22) return 1 - 0.58 * (p / 0.22);
  if (p < 0.62) return 0.42;
  return 0.42 + 0.58 * ((p - 0.62) / 0.38);
}

export function leanFromLook(lookX: number): number {
  return lookX * 1.55;
}

export function idleBob(timeMs: number, amplitude = 1.4, periodMs = 3200): number {
  return Math.sin((timeMs / periodMs) * Math.PI * 2) * amplitude;
}

export function idleTilt(timeMs: number, amplitude = 2.6, periodMs = 5200): number {
  return Math.sin((timeMs / periodMs) * Math.PI * 2) * amplitude;
}

/** Eight glance directions around the face, slightly biased horizontal. */
export function glanceFromSeed(seed: number, max = 4.2): Point {
  const a = ((seed % 8) + 8) % 8 * (Math.PI / 4);
  return { x: Math.cos(a) * max, y: Math.sin(a) * max * 0.55 };
}

export function hopPeakForState(state: OrbState): number {
  if (state === "working") return 6;
  if (state === "thinking") return 8;
  if (state === "happy" || state === "success") return 18;
  if (state === "error") return 4;
  return 15;
}

export type BlinkKind = "single" | "double" | "slow" | "wink-left" | "wink-right";

export function springStep(
  value: number,
  velocity: number,
  target: number,
  dt: number,
  stiffness = 150,
  damping = 26,
): { value: number; velocity: number } {
  const accel = (target - value) * stiffness - velocity * damping;
  const nextVel = velocity + accel * dt;
  return { value: value + nextVel * dt, velocity: nextVel };
}

/** Close fast, tiny hold, open a bit slower. 1 = open, ~0.1 = shut. */
export function blinkLid(progress: number): number {
  const p = clamp01(progress);
  if (p === 0 || p === 1) return 1;
  if (p < 0.36) {
    const u = p / 0.36;
    return 1 - u * u * 0.9;
  }
  if (p < 0.5) return 0.1;
  const u = (p - 0.5) / 0.5;
  const open = 1 - (1 - u) ** 3;
  return 0.1 + open * 0.9;
}

export function blinkDuration(kind: BlinkKind): number {
  if (kind === "slow") return 280;
  if (kind === "double") return 340;
  if (kind === "wink-left" || kind === "wink-right") return 190;
  return 150;
}

export function blinkLids(kind: BlinkKind, progress: number): { left: number; right: number } {
  if (kind === "double") {
    const p = clamp01(progress);
    if (p < 0.4) {
      const lid = blinkLid(p / 0.4);
      return { left: lid, right: lid };
    }
    if (p < 0.54) return { left: 1, right: 1 };
    const lid = blinkLid((p - 0.54) / 0.46);
    return { left: lid, right: lid };
  }
  if (kind === "slow") {
    const p = clamp01(progress);
    if (p < 0.4) {
      const u = p / 0.4;
      const lid = 1 - u * u * 0.88;
      return { left: lid, right: lid };
    }
    if (p < 0.62) return { left: 0.12, right: 0.12 };
    const u = (p - 0.62) / 0.38;
    const open = 1 - (1 - u) ** 3;
    const lid = 0.12 + open * 0.88;
    return { left: lid, right: lid };
  }
  const lid = blinkLid(progress);
  if (kind === "wink-left") return { left: lid, right: 1 };
  if (kind === "wink-right") return { left: 1, right: lid };
  return { left: lid, right: lid };
}

export function pickBlinkKind(rand: number): BlinkKind {
  if (rand < 0.14) return "double";
  if (rand < 0.24) return "slow";
  if (rand < 0.31) return "wink-left";
  if (rand < 0.38) return "wink-right";
  return "single";
}

export function shouldSaccade(from: Point, to: Point, threshold = 2.15): boolean {
  return Math.hypot(to.x - from.x, to.y - from.y) > threshold;
}

/** Look down on the crouch, up at the apex, settle on landing. */
export function hopLookOffset(progress: number): Point {
  const p = clamp01(progress);
  if (p === 0 || p === 1) return { x: 0, y: 0 };
  if (p < 0.16) return { x: 0, y: (p / 0.16) * 2.1 };
  if (p < 0.52) {
    const t = (p - 0.16) / 0.36;
    return { x: 0.35 * t, y: 2.1 - 4.1 * t };
  }
  const t = (p - 0.52) / 0.48;
  return { x: 0.35 * (1 - t), y: -2 + 2 * t };
}

/** Multiplier on eye height: squint on takeoff/land, widen in the air. */
export function eyeSquint(progress: number): number {
  const p = clamp01(progress);
  if (p === 0 || p === 1) return 1;
  if (p < 0.14) return 1 - 0.16 * (p / 0.14);
  if (p < 0.78) {
    const t = (p - 0.14) / 0.64;
    return 0.84 + 0.32 * Math.sin(t * Math.PI);
  }
  return 1 - 0.2 * Math.sin(((p - 0.78) / 0.22) * Math.PI);
}

export function lookRotate(lookX: number, lookY: number, base: number): number {
  return base + lookX * 1.05 + lookY * 0.28;
}

export function idleDrift(timeMs: number): Point {
  return {
    x: Math.sin((timeMs / 3100) * Math.PI * 2) * 0.38,
    y: Math.sin((timeMs / 4300) * Math.PI * 2 + 1.1) * 0.22,
  };
}

/**
 * Grok Bot hop marks: strokes draw on at the apex, hold, then fade while drifting out.
 * `draw` is SVG stroke-dashoffset with pathLength 1 (1 = hidden, 0 = fully drawn).
 */
export function flourishEnvelope(
  progress: number,
  delay = 0.17,
): { draw: number; opacity: number; expand: number } {
  const p = clamp01(progress);
  if (p <= delay) return { draw: 1, opacity: 0, expand: 0.88 };
  const local = (p - delay) / (1 - delay);
  if (local < 0.32) {
    const t = local / 0.32;
    const k = t * t * (3 - 2 * t);
    return { draw: 1 - k, opacity: Math.min(1, t * 1.35), expand: 0.88 + 0.12 * k };
  }
  if (local < 0.58) {
    return { draw: 0, opacity: 1, expand: 1 };
  }
  const t = (local - 0.58) / 0.42;
  return { draw: 0, opacity: 1 - t * t, expand: 1 + 0.16 * t };
}

export function flourishShouldShow(kind: IdleAction | null): boolean {
  return kind === "hop" || kind === "spin";
}

export const ORB_STATES: OrbState[] = [
  "idle",
  "thinking",
  "happy",
  "working",
  "success",
  "error",
];
