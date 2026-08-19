import { describe, expect, it } from "vitest";
import {
  actionDuration,
  blinkDuration,
  blinkLid,
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
  lerp,
  lerpPoint,
  lookRotate,
  lookSweepOffset,
  mapPointerToEyeOffset,
  ORB_STATES,
  pickBlinkKind,
  pickIdleAction,
  resolveOrbTone,
  shouldSaccade,
  smileEyeScale,
  spinAngle,
  springStep,
  squishScale,
  stretchScale,
  wiggleTilt,
  type OrbState,
} from "./orb";

describe("orb pointer and morph helpers", () => {
  it("lerps toward the target by the given factor", () => {
    expect(lerp(0, 10, 0.2)).toBe(2);
    expect(lerp(8, 10, 0.5)).toBe(9);
    expect(lerpPoint({ x: 0, y: 10 }, { x: 10, y: 0 }, 0.25)).toEqual({ x: 2.5, y: 7.5 });
  });

  it("maps a far pointer to a clamped eye offset on the unit circle", () => {
    const offset = mapPointerToEyeOffset(1000, 500, 0, 0, 6);
    const length = Math.hypot(offset.x, offset.y);
    expect(length).toBeCloseTo(6, 8);
    expect(offset.x).toBeGreaterThan(offset.y);
    expect(offset.x).toBeGreaterThan(0);
  });

  it("returns a zero offset when the pointer sits on the origin", () => {
    expect(mapPointerToEyeOffset(40, 40, 40, 40, 8)).toEqual({ x: 0, y: 0 });
  });

  it("maps a near pointer without stretching past the actual delta", () => {
    const offset = mapPointerToEyeOffset(3, 4, 0, 0, 10);
    expect(offset.x).toBeCloseTo(3);
    expect(offset.y).toBeCloseTo(4);
  });

  it("returns a distinct morph for every public Orb state", () => {
    const morphs = ORB_STATES.map((state) => getOrbMorph(state));
    const idle = getOrbMorph("idle");
    expect(idle.bodyRx).toBe(idle.bodyRy);
    expect(idle.eyeH).toBeGreaterThan(idle.eyeW);
    expect(getOrbMorph("thinking").eyeY).toBeLessThan(idle.eyeY);
    expect(getOrbMorph("happy").eyeH).toBeLessThan(idle.eyeH);
    expect(getOrbMorph("success").eyeH).toBeLessThan(idle.eyeH);
    expect(getOrbMorph("error").eyeW).toBeGreaterThan(idle.eyeW);
    expect(getOrbMorph("working").bodyRy).toBeGreaterThan(getOrbMorph("working").bodyRx);
    expect(new Set(morphs.map((m) => `${m.bodyRx}-${m.bodyRy}-${m.eyeH}-${m.eyeY}`)).size).toBe(
      ORB_STATES.length,
    );
  });

  it("breathing oscillates around 1 using a sine wave", () => {
    expect(breathScale(0, 0.03, 1000)).toBeCloseTo(1);
    expect(breathScale(250, 0.03, 1000)).toBeCloseTo(1.03);
    expect(breathScale(750, 0.03, 1000)).toBeCloseTo(0.97);
  });

  it("rejects unknown states at the type boundary by only mapping known keys", () => {
    const known: OrbState = "idle";
    expect(getOrbMorph(known).accent).toBe("#ffffff");
  });

  it("picks a black ink orb on light surfaces and a paper orb on dark ones", () => {
    expect(resolveOrbTone("light")).toBe("ink");
    expect(resolveOrbTone("dark")).toBe("paper");
    expect(getOrbPalette("ink").body).toBe("#111111");
    expect(getOrbPalette("paper").body).toBe("#ffffff");
    expect(getOrbPalette("ink").eye).toBe("#f5f5f2");
    expect(getOrbPalette("paper").eye).toBe("#111111");
  });

  it("crouches before a hop, peaks in the air, and lands at zero", () => {
    expect(hopOffset(0, 16)).toBeCloseTo(0);
    expect(hopOffset(1, 16)).toBeCloseTo(0);
    expect(hopOffset(0.08, 16)).toBeGreaterThan(0);
    expect(hopOffset(0.5, 16)).toBeLessThan(-12);
    expect(hopOffset(0.5, 16)).toBeLessThan(hopOffset(0.25, 16));
  });

  it("squashes wide on the crouch and stretches in the air", () => {
    expect(hopSquash(0)).toEqual({ sx: 1, sy: 1 });
    expect(hopSquash(1)).toEqual({ sx: 1, sy: 1 });
    const crouch = hopSquash(0.12);
    expect(crouch.sx).toBeGreaterThan(crouch.sy);
    const air = hopSquash(0.4);
    expect(air.sy).toBeGreaterThan(air.sx);
  });

  it("cycles through a mix of idle actions, not only hops", () => {
    const kinds = [0.05, 0.25, 0.45, 0.58, 0.68, 0.8, 0.95].map(pickIdleAction);
    expect(kinds).toContain("hop");
    expect(kinds).toContain("squish");
    expect(kinds).toContain("wiggle");
    expect(kinds).toContain("look");
    expect(new Set(kinds).size).toBeGreaterThanOrEqual(5);
    expect(actionDuration("hop")).toBeGreaterThan(800);
    expect(actionDuration("look")).toBeGreaterThan(actionDuration("squish"));
  });

  it("squishes, stretches, wiggles, spins and smiles on a closed loop", () => {
    expect(squishScale(0)).toEqual({ sx: 1, sy: 1 });
    expect(squishScale(1)).toEqual({ sx: 1, sy: 1 });
    expect(squishScale(0.3).sx).toBeGreaterThan(squishScale(0.3).sy);
    expect(stretchScale(0.5).sy).toBeGreaterThan(stretchScale(0.5).sx);
    expect(wiggleTilt(0.2)).not.toBeCloseTo(0);
    expect(wiggleTilt(1)).toBeCloseTo(0);
    expect(spinAngle(0)).toBeCloseTo(0);
    expect(spinAngle(1)).toBeCloseTo(360);
    expect(smileEyeScale(0.4)).toBeLessThan(0.5);
    expect(smileEyeScale(1)).toBe(1);
    expect(lookSweepOffset(0.15).x).toBeLessThan(0);
    expect(lookSweepOffset(0.7).x).toBeGreaterThan(0);
    expect(leanFromLook(4)).toBeGreaterThan(0);
  });

  it("bobs and tilts around zero", () => {
    expect(idleBob(0)).toBeCloseTo(0);
    expect(idleBob(600, 2.4, 2400)).toBeCloseTo(2.4);
    expect(idleBob(1800, 2.4, 2400)).toBeCloseTo(-2.4);
    expect(idleTilt(0)).toBeCloseTo(0);
    expect(idleTilt(900, 5.5, 3600)).toBeCloseTo(5.5);
    expect(idleTilt(2700, 5.5, 3600)).toBeCloseTo(-5.5);
  });

  it("glances in eight distinct directions", () => {
    const glances = [0, 1, 2, 3, 4, 5, 6, 7].map((seed) => glanceFromSeed(seed));
    const keys = new Set(glances.map((g) => `${g.x.toFixed(3)},${g.y.toFixed(3)}`));
    expect(keys.size).toBe(8);
    expect(Math.hypot(glances[0].x, glances[0].y)).toBeGreaterThan(2);
  });

  it("uses a higher hop for happy than for working", () => {
    expect(hopPeakForState("happy")).toBeGreaterThan(hopPeakForState("working"));
    expect(hopPeakForState("idle")).toBeGreaterThan(hopPeakForState("thinking"));
  });

  it("springs toward the target without overshooting when overdamped", () => {
    let value = 0;
    let velocity = 0;
    for (let i = 0; i < 90; i += 1) {
      const next = springStep(value, velocity, 10, 1 / 60, 150, 26);
      value = next.value;
      velocity = next.velocity;
    }
    expect(value).toBeGreaterThan(9.5);
    expect(value).toBeLessThan(10.2);
    expect(Math.abs(velocity)).toBeLessThan(0.4);
  });

  it("closes the lid in the middle of a blink and opens at the ends", () => {
    expect(blinkLid(0)).toBe(1);
    expect(blinkLid(1)).toBe(1);
    expect(blinkLid(0.4)).toBeCloseTo(0.1);
    expect(blinkLid(0.2)).toBeGreaterThan(blinkLid(0.35));
    expect(blinkLid(0.85)).toBeGreaterThan(blinkLid(0.6));
  });

  it("keeps the other eye open during a wink", () => {
    const wink = blinkLids("wink-left", 0.4);
    expect(wink.left).toBeLessThan(0.3);
    expect(wink.right).toBe(1);
    expect(blinkDuration("slow")).toBeGreaterThan(blinkDuration("single"));
    expect(pickBlinkKind(0.05)).toBe("double");
    expect(pickBlinkKind(0.9)).toBe("single");
  });

  it("saccades only when the look jump is large", () => {
    expect(shouldSaccade({ x: 0, y: 0 }, { x: 0.4, y: 0.2 })).toBe(false);
    expect(shouldSaccade({ x: 0, y: 0 }, { x: 4, y: 1 })).toBe(true);
  });

  it("looks down on takeoff and up at the apex of a hop", () => {
    expect(hopLookOffset(0)).toEqual({ x: 0, y: 0 });
    expect(hopLookOffset(0.1).y).toBeGreaterThan(0);
    expect(hopLookOffset(0.4).y).toBeLessThan(0);
    expect(eyeSquint(0.1)).toBeLessThan(1);
    expect(eyeSquint(0.45)).toBeGreaterThan(1);
  });

  it("tilts the capsules toward the look and drifts around rest", () => {
    expect(lookRotate(4, 0, -8)).toBeGreaterThan(-8);
    expect(idleDrift(0).x).toBeCloseTo(0);
    expect(Math.abs(idleDrift(775).x)).toBeGreaterThan(0.2);
  });
});
