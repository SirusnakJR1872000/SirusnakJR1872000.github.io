"use client";

import { useEffect, useRef } from "react";

const LINES_PER_RIBBON = 46;
const SEGMENTS = 100;
// Olive, as "r, g, b" so it can take different opacities.
const RGB = "82, 102, 40";

type Ribbon = {
  /** Phase offset between this ribbon and the other one. */
  phase: number;
  /** How far each line's phase is spread across the ribbon; makes the twist. */
  spread: number;
  /** Wave speed multiplier. */
  speed: number;
};

const ribbons: Ribbon[] = [
  { phase: 0, spread: 0.9, speed: 1 },
  { phase: Math.PI, spread: 0.8, speed: 1 },
];

/** Smoothed pointer position in canvas pixels, plus how strongly it bends the lines. */
type Pointer = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  strength: number;
  targetStrength: number;
};

function drawRibbons(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  pointer: Pointer,
) {
  ctx.clearRect(0, 0, width, height);

  // Lines fade in from the left so the waves dissolve into the page.
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0.1, `rgba(${RGB}, 0)`);
  gradient.addColorStop(0.35, `rgba(${RGB}, 0.26)`);
  gradient.addColorStop(1, `rgba(${RGB}, 0.42)`);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 0.6;

  const radius = Math.min(width, height) * 0.28;

  for (const ribbon of ribbons) {
    for (let line = 0; line < LINES_PER_RIBBON; line++) {
      const s = line / (LINES_PER_RIBBON - 1);
      ctx.beginPath();

      for (let seg = 0; seg <= SEGMENTS; seg++) {
        const u = seg / SEGMENTS;
        const x = u * width;

        // Overall path rises toward the top right.
        const center = height * (0.62 - 0.15 * u);
        // Waves grow larger as they travel right.
        const amplitude =
          height *
          (0.03 + 0.34 * u ** 1.3) *
          (0.82 + 0.18 * Math.sin(t * 0.35 + s * 2));
        const angle =
          u * Math.PI * 1.5 -
          Math.PI * 1.05 +
          Math.sin(t * ribbon.speed) * 0.55 +
          ribbon.phase +
          (s - 0.5) * ribbon.spread * (0.5 + u);
        // A slower second wave keeps the motion from looking mechanical.
        const drift = Math.sin(u * Math.PI * 1.3 + t * 0.6) * height * 0.04;
        let y = center + Math.sin(angle) * amplitude + drift;

        // Lines near the pointer bend toward it.
        if (pointer.strength > 0.001) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const falloff = Math.exp(
            -(dx * dx + dy * dy) / (2 * radius * radius),
          );
          y += (pointer.y - y) * 0.35 * falloff * pointer.strength;
        }

        if (seg === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

/** Animated line-ribbon waves for the hero. */
export function WaveCanvas({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pointer: Pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      strength: 0,
      targetStrength: 0,
    };
    let width = 0;
    let height = 0;
    let frameId: number | null = null;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reducedMotion) drawRibbons(ctx, width, height, 0, pointer);
    };

    const animate = (now: number) => {
      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;
      pointer.strength += (pointer.targetStrength - pointer.strength) * 0.05;
      drawRibbons(ctx, width, height, now / 1800, pointer);
      frameId = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    };

    // The canvas ignores pointer events so it never blocks the page, so track the window.
    const onPointerMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      // A mirrored canvas needs the pointer mirrored too.
      const x = flip ? box.right - event.clientX : event.clientX - box.left;
      const y = event.clientY - box.top;
      const inside =
        x >= -60 && x <= box.width + 60 && y >= -60 && y <= box.height + 60;
      if (inside && pointer.targetStrength === 0) {
        pointer.x = x;
        pointer.y = y;
      }
      pointer.targetX = x;
      pointer.targetY = y;
      pointer.targetStrength = inside ? 1 : 0;
    };
    const onPointerLeave = () => {
      pointer.targetStrength = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Stop drawing while the hero is scrolled out of view.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (reducedMotion) return;
      if (!entry.isIntersecting) stop();
      else if (frameId === null) frameId = requestAnimationFrame(animate);
    });
    visibilityObserver.observe(canvas);

    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove);
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        onPointerLeave,
      );
    };
  }, [flip]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute ${flip ? "-scale-x-100" : ""} ${className}`}
    />
  );
}
