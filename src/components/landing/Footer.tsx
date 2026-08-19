"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  blinkDuration,
  blinkLids,
  idleDrift,
  leanFromLook,
  lookRotate,
  mapPointerToEyeOffset,
  pickBlinkKind,
  springStep,
  type BlinkKind,
} from "@/lib/orb";

const VB_W = 1440;
const VB_MIN_Y = -20;
const BASE_Y = 600;
const VB_H = BASE_Y - VB_MIN_Y; // Exact 620 so BASE_Y is mathematically the bottom edge of the SVG
const FACE_X = 720;
const FACE_Y = 360;
const LEFT = { x: -95, y: 0 };
const RIGHT = { x: 95, y: 0 };
const MAX_LOOK = 42;
const LOOK_UNIT = 4.6 / MAX_LOOK;

export function Footer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const faceRef = useRef<SVGGElement>(null);
  const leftRef = useRef<SVGGElement>(null);
  const rightRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const face = faceRef.current;
    const leftEye = leftRef.current;
    const rightEye = rightRef.current;
    if (!svg || !face || !leftEye || !rightEye) return;

    let raf = 0;
    let lastNow = performance.now();
    let pointerX = 0;
    let pointerY = 0;
    let lastPointerAt = performance.now();
    let lookX = 0;
    let lookY = 0;
    let lookVX = 0;
    let lookVY = 0;
    let blinkStart = 0;
    let blinkDur = 0;
    let blinkKind: BlinkKind = "single";
    let nextBlink = performance.now() + 1800 + Math.random() * 2400;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clientToSvg = (clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return { x: FACE_X, y: FACE_Y };
      }
      return {
        x: ((clientX - rect.left) / rect.width) * VB_W,
        y: VB_MIN_Y + ((clientY - rect.top) / rect.height) * VB_H,
      };
    };

    const applyTargetFromClient = (clientX: number, clientY: number) => {
      lastPointerAt = performance.now();
      const point = clientToSvg(clientX, clientY);
      const offset = mapPointerToEyeOffset(point.x, point.y, FACE_X, FACE_Y, MAX_LOOK);
      pointerX = offset.x;
      pointerY = offset.y;
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

    const tick = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;

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
      const drift = reduced ? { x: 0, y: 0 } : idleDrift(now);
      const desiredX = reduced ? 0 : pointerStale ? drift.x * 8 : pointerX + drift.x * 0.45;
      const desiredY = reduced ? 0 : pointerStale ? drift.y * 8 : pointerY + drift.y * 0.45;

      const sprungX = springStep(lookX, lookVX, desiredX, dt, 128, 24);
      const sprungY = springStep(lookY, lookVY, desiredY, dt, 128, 24);
      lookX = sprungX.value;
      lookVX = sprungX.velocity;
      lookY = sprungY.value;
      lookVY = sprungY.velocity;

      const unitX = lookX * LOOK_UNIT;
      const unitY = lookY * LOOK_UNIT;
      const lean = reduced ? 0 : leanFromLook(unitX);
      const rot = lookRotate(unitX, unitY, -8);

      face.setAttribute(
        "transform",
        `translate(${FACE_X + lookX} ${FACE_Y + lookY}) rotate(${lean})`,
      );
      leftEye.setAttribute(
        "transform",
        `translate(${LEFT.x} ${LEFT.y}) rotate(${rot}) scale(1 ${lids.left})`,
      );
      rightEye.setAttribute(
        "transform",
        `translate(${RIGHT.x} ${RIGHT.y}) rotate(${rot}) scale(1 ${lids.right})`,
      );

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouch, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouch);
    };
  }, []);

  return (
    <footer className="relative overflow-hidden bg-background text-foreground select-none">
      {/* Overlaid Floating CTA Buttons */}
      <div className="relative z-10 pt-4 sm:pt-6 pb-2 flex items-center justify-center pointer-events-auto">
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/register">
            <button className="h-11 px-7 rounded-full bg-foreground text-background font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer">
              Empezar gratis
              <ArrowRight size={15} />
            </button>
          </Link>
          <Link href="/login">
            <button className="h-11 px-7 rounded-full border border-line bg-surface hover:bg-surface/80 text-foreground font-semibold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-xs backdrop-blur-sm cursor-pointer">
              Iniciar sesión
            </button>
          </Link>
        </div>
      </div>

      {/* Giant Architectural Wireframe Orb seated with exact zero-gap precision on top of footer divider */}
      <div className="relative w-full pt-16 sm:pt-24 pb-0 flex flex-col items-center justify-end overflow-visible -mb-px">
        <div className="w-full max-w-[1440px] px-2 sm:px-6 mx-auto relative flex justify-center overflow-visible">
          <svg
            ref={svgRef}
            viewBox={`0 ${VB_MIN_Y} ${VB_W} ${VB_H}`}
            className="w-full max-w-6xl h-auto overflow-visible text-foreground/20 dark:text-foreground/25 block"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            data-footer-orb="svg"
          >
            {/* Giant Outer Wireframe Body Dome (Ends precisely at SVG bottom edge) */}
            <path
              d={`M 140 ${BASE_Y} A 580 580 0 0 1 1300 ${BASE_Y}`}
              className="transition-colors duration-500 hover:text-foreground/35"
            />

            <g ref={faceRef} data-footer-orb="face" transform={`translate(${FACE_X} ${FACE_Y})`}>
              <g ref={leftRef} data-footer-orb="eye-left" transform={`translate(${LEFT.x} ${LEFT.y}) rotate(-8)`}>
                <rect
                  x="-42"
                  y="-90"
                  width="84"
                  height="180"
                  rx="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  className="transition-colors duration-300 hover:text-foreground/60"
                />
              </g>
              <g ref={rightRef} data-footer-orb="eye-right" transform={`translate(${RIGHT.x} ${RIGHT.y}) rotate(-8)`}>
                <rect
                  x="-42"
                  y="-90"
                  width="84"
                  height="180"
                  rx="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  className="transition-colors duration-300 hover:text-foreground/60"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Main Spacious Footer Links Container - The single continuous horizontal horizon line */}
      <div className="border-t border-line bg-background relative z-10">
        <div className="mx-auto max-w-[1500px] px-8 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
            {/* Brand Column */}
            <div className="lg:col-span-3 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-[0.3em] text-foreground uppercase">
                  ORBIX
                </span>
              </div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                © {new Date().getFullYear()} ORBIX SPA
              </p>
              <p className="text-sm text-secondary leading-relaxed max-w-sm pt-1">
                La plataforma de gestión financiera, facturación DTE, nómina Previred y conciliación bancaria con inteligencia artificial para empresas en Chile.
              </p>
            </div>

            {/* Navigation Columns */}
            <div className="lg:col-span-9 lg:border-l lg:border-line lg:pl-16">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 lg:gap-12">
                {/* Column 1: Productos */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                    Productos
                  </p>
                  <ul className="space-y-3 text-sm text-secondary">
                    <li><a href="#producto" className="hover:text-foreground transition-colors">Facturación DTE</a></li>
                    <li><a href="#producto" className="hover:text-foreground transition-colors">Nómina & Previred</a></li>
                    <li><a href="#producto" className="hover:text-foreground transition-colors">Conciliación</a></li>
                    <li><a href="#asistente" className="hover:text-foreground transition-colors">Orb Asistente IA</a></li>
                  </ul>
                </div>

                {/* Column 2: Soluciones */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                    Soluciones
                  </p>
                  <ul className="space-y-3 text-sm text-secondary">
                    <li><Link href="/register" className="hover:text-foreground transition-colors">Pymes & SpA</Link></li>
                    <li><Link href="/register" className="hover:text-foreground transition-colors">Estudios Contables</Link></li>
                    <li><Link href="/register" className="hover:text-foreground transition-colors">Multi-RUT</Link></li>
                    <li><a href="#precios" className="hover:text-foreground transition-colors">Planes y Precios</a></li>
                  </ul>
                </div>

                {/* Column 3: Desarrolladores */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                    Desarrolladores
                  </p>
                  <ul className="space-y-3 text-sm text-secondary">
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">API DTE XML</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Webhooks SII</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Documentación</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Estado de Red</span></li>
                  </ul>
                </div>

                {/* Column 4: Empresa */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                    Empresa
                  </p>
                  <ul className="space-y-3 text-sm text-secondary">
                    <li><a href="mailto:hola@orbix.cl" className="hover:text-foreground transition-colors">Contacto</a></li>
                    <li><a href="mailto:soporte@orbix.cl" className="hover:text-foreground transition-colors">Soporte 24/7</a></li>
                    <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link></li>
                    <li><Link href="/register" className="hover:text-foreground transition-colors">Crear cuenta</Link></li>
                  </ul>
                </div>

                {/* Column 5: Legal */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                    Legal
                  </p>
                  <ul className="space-y-3 text-sm text-secondary">
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Términos de Uso</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Privacidad</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Normativa SII</span></li>
                    <li><span className="cursor-pointer hover:text-foreground transition-colors">Dirección del Trabajo</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
