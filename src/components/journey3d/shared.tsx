"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { signal } from "@/components/journey3d/signal";

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

/** Eased 0–1 progress of a boot step, from the room's clock. */
export const phase = (start: number, duration: number) =>
  smooth(clamp01((signal.time - start) / duration));

/** A colour bright enough to bloom. */
export const hdr = (hex: string, power: number) =>
  new THREE.Color(hex).multiplyScalar(power);

export const LIME = "#c9f751";
export const PALE = "#f4ffc0";
export const GOLD = "#ffb52e";

/** Height of the scan plane at a given boot time. */
export const scanHeight = () => 8 - 8 * ((signal.time - 1.05) / 1.5);

/** The platform: a round floor plate, then a two-tier base. */
export const DISC = { z: 0.35, radius: 5.9, top: 0.14 };
export const LOWER = { side: 5.5, height: 0.56 };
export const UPPER = { side: 4.7, height: 0.34 };
export const DECK = DISC.top + LOWER.height + UPPER.height;

/** Glass that glows at its edges. Used for tubes, the brain and the column. */
export function glassMaterial({
  color = LIME,
  fill = 0.05,
  rim = 1.5,
  power = 2.4,
}: {
  color?: string;
  fill?: number;
  rim?: number;
  power?: number;
}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uFill: { value: fill },
      uRim: { value: rim },
      uPower: { value: power },
      uReach: { value: 1 },
      uLevel: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vU;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vU = uv.x;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uFill, uRim, uPower, uReach, uLevel;
      varying vec3 vN; varying vec3 vV; varying float vU;
      void main() {
        if (vU > uReach) discard;
        // clamp: rounding can push the base below zero, and pow() of that is
        // NaN, which bloom smears into black blocks.
        float f = pow(clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * (uFill + f * uRim) * uLevel, 1.0);
      }`,
  });
}

/** A glowing glass tube that can grow along its length. */
export function GlowTube({
  curve,
  radius,
  segments = 90,
  radial = 10,
  fill,
  rim,
  reach,
  level,
}: {
  curve: THREE.Curve<THREE.Vector3>;
  radius: number;
  segments?: number;
  radial?: number;
  fill?: number;
  rim?: number;
  reach: () => number;
  level: () => number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(
    () => new THREE.TubeGeometry(curve, segments, radius, radial),
    [curve, segments, radius, radial],
  );
  const material = useMemo(() => glassMaterial({ fill, rim }), [fill, rim]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const u = (ref.current.material as THREE.ShaderMaterial).uniforms;
    u.uReach.value = THREE.MathUtils.damp(u.uReach.value, reach(), 4, delta);
    u.uLevel.value = THREE.MathUtils.damp(u.uLevel.value, level(), 4, delta);
  });

  return <mesh ref={ref} geometry={geometry} material={material} />;
}

export function smoothCurve(points: [number, number, number][]) {
  return new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
    false,
    "centripetal",
  );
}
