"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, invalidate, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { Gpu } from "@/components/journey3d/Gpu";
import { Platform } from "@/components/journey3d/Platform";
import { Room } from "@/components/journey3d/Room";
import { Streams } from "@/components/journey3d/Streams";
import { signal, TARGET_Y } from "@/components/journey3d/signal";

const DISTANCE = 27.5;
const ELEVATION = THREE.MathUtils.degToRad(27);
const BASE_FOV = 24;
const DESIGN_ASPECT = 1717 / 916;
const SHIFT = 0.14; // the engine sits right of centre, beside the text

// Slow camera moves for each phase: [distance scale, height, sideways].
function shot() {
  if (signal.stage < 0) return [0.97, 0.3, 0];
  if (signal.stage >= 4) return [1, 0, 0];
  return [
    [0.995, 0.05, -0.12],
    [0.995, 0.08, 0.14],
    [0.995, 0.12, -0.12],
    [0.995, 0.14, 0.12],
  ][signal.stage];
}

/**
 * Draws at up to 60fps while someone is interacting, and 30fps when the page
 * is just sitting there. Saves a lot of GPU work and battery.
 */
let lastActive = 0;
const isActive = () => performance.now() - lastActive < 2500 || signal.time < 7;

function Pacer() {
  useEffect(() => {
    const bump = () => {
      lastActive = performance.now();
    };
    bump();
    window.addEventListener("scroll", bump, { passive: true });
    window.addEventListener("pointermove", bump, { passive: true });
    window.addEventListener("pointerdown", bump, { passive: true });
    let frame = 0;
    let last = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const gap = isActive() ? 1000 / 60 : 1000 / 30;
      if (now - last >= gap - 2) {
        last = now;
        invalidate();
      }
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", bump);
      window.removeEventListener("pointermove", bump);
      window.removeEventListener("pointerdown", bump);
    };
  }, []);
  return null;
}

function Rig({
  compact,
  onReady,
  onSlow,
}: {
  compact: boolean;
  onReady: () => void;
  onSlow: () => void;
}) {
  const look = useRef(new THREE.Vector3(0, TARGET_Y, 0));
  const pose = useRef({ dist: 0.96, y: 0.25, x: 0, px: 0, py: 0 });
  const started = useRef(-1);
  const slow = useRef({ sum: 0, count: 0 });
  const lastSize = useRef("");
  const ready = useRef(false);
  const scratch = useRef(new THREE.Vector3());

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20);

    // If active frames stay slow, step down to fewer pixels.
    if (isActive() && signal.time > 7) {
      const m = slow.current;
      m.sum += rawDelta;
      m.count += 1;
      if (m.count === 90) {
        if (m.sum / 90 > 1 / 42) onSlow();
        m.sum = 0;
        m.count = 0;
      }
    }
    const cam = state.camera as THREE.PerspectiveCamera;
    const { width: W, height: H } = state.size;

    if (started.current < 0) started.current = state.clock.elapsedTime;
    signal.time = signal.reduced
      ? 100
      : state.clock.elapsedTime - started.current;

    const key = `${W}x${H}`;
    if (key !== lastSize.current) {
      lastSize.current = key;
      const aspect = W / H;
      cam.aspect = aspect;
      if (compact) {
        cam.fov = 26.6;
        cam.clearViewOffset();
      } else {
        // Keep the scene's width across narrower windows.
        const half = THREE.MathUtils.degToRad(BASE_FOV / 2);
        const fit = aspect < DESIGN_ASPECT ? DESIGN_ASPECT / aspect : 1;
        cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(half) * fit));
        cam.setViewOffset(W, H, -SHIFT * W, 0, W, H);
      }
      cam.updateProjectionMatrix();
    }

    const p = pose.current;
    const [dist, y, x] = compact ? [1, 1.6, 0] : shot();
    const d = THREE.MathUtils.damp;
    const speed = signal.reduced ? 100 : 1.6;
    p.dist = d(p.dist, dist, speed, delta);
    p.y = d(p.y, y, speed, delta);
    p.x = d(p.x, x, speed, delta);
    p.px = d(p.px, signal.reduced ? 0 : signal.pointerX, 2.5, delta);
    p.py = d(p.py, signal.reduced ? 0 : signal.pointerY, 2.5, delta);

    const R = DISTANCE * p.dist;
    look.current.set(p.x * 0.5, TARGET_Y + p.y, 0);
    cam.position.set(
      p.x + p.px * 0.3,
      TARGET_Y + p.y + R * Math.sin(ELEVATION) - p.py * 0.2,
      R * Math.cos(ELEVATION),
    );
    cam.lookAt(look.current);
    cam.updateMatrixWorld();

    // Keep the HTML pinned to the 3D scene. Transforms avoid layout and
    // repaints; positions are only rounded once still, so moving is smooth and
    // resting text is perfectly crisp.
    signal.anchors.forEach((anchor) => {
      const v = scratch.current.set(...anchor.world).project(cam);
      const x = ((v.x + 1) / 2) * W;
      const y = ((1 - v.y) / 2) * H;
      const { el } = anchor;
      if (anchor.x < -9000) {
        el.style.left = "0";
        el.style.top = "0";
        el.style.willChange = "transform";
      }
      if (Math.abs(x - anchor.x) > 0.03 || Math.abs(y - anchor.y) > 0.03) {
        anchor.x = x;
        anchor.y = y;
        anchor.settled = false;
        el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      } else if (!anchor.settled) {
        anchor.settled = true;
        el.style.transform = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;
      }
    });

    if (!ready.current) {
      ready.current = true;
      onReady();
    }
  });

  return null;
}

// How many pixels the 3D scene may render. Text is HTML and stays sharp at
// any setting, so this only affects the soft, glowing 3D imagery.
const PIXEL_BUDGETS = [2.3e6, 1.5e6, 1e6];

function pixelRatioFor(budget: number) {
  const pixels = window.innerWidth * window.innerHeight;
  return Math.min(window.devicePixelRatio, Math.sqrt(budget / pixels));
}

export default function Stage({
  compact,
  onReady,
}: {
  compact: boolean;
  onReady: () => void;
}) {
  const [tier, setTier] = useState(compact ? 1 : 0);

  return (
    <Canvas
      flat
      frameloop="demand"
      dpr={pixelRatioFor(PIXEL_BUDGETS[tier])}
      camera={{ fov: BASE_FOV, near: 1, far: 140, position: [0, 14, 24.5] }}
      gl={{
        antialias: false,
        stencil: false,
        depth: true,
        powerPreference: "high-performance",
      }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Pacer />
      <Rig
        compact={compact}
        onReady={onReady}
        onSlow={() => setTier((t) => Math.min(PIXEL_BUDGETS.length - 1, t + 1))}
      />
      <Room compact={compact} />
      <Platform />
      <Gpu />
      <Streams />
      {/* Compiles every shader up front, so boot has no mid-animation stalls */}
      <Preload all />
      <EffectComposer multisampling={compact ? 0 : 2} enableNormalPass={false}>
        <Bloom
          mipmapBlur
          levels={5}
          luminanceThreshold={1}
          luminanceSmoothing={0.15}
          intensity={0.55}
          radius={0.62}
        />
      </EffectComposer>
    </Canvas>
  );
}
