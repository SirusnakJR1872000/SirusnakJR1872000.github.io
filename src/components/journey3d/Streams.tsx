"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  clamp01,
  GlowTube,
  phase,
  smoothCurve,
} from "@/components/journey3d/shared";
import { onPlane, signal } from "@/components/journey3d/signal";

type P = [number, number, number];
/** Design pixels, plus how far toward the viewer (world units). */
const path = (pts: P[]) =>
  smoothCurve(
    pts.map(([x, y, z]) => {
      const w = onPlane(x, y);
      return [w[0], w[1], w[2] + z] as [number, number, number];
    }),
  );

// One pathway per year, oldest first, from the chip out to its card.
const MAIN: P[][] = [
  [
    [1000, 482, 0.6],
    [952, 492, 0.4],
    [918, 486, 0.1],
    [892, 474, 0],
  ],
  [
    [1250, 478, 0.6],
    [1330, 492, 0.4],
    [1400, 482, 0.2],
    [1436, 446, 0],
    [1442, 392, 0],
  ],
  [
    [1010, 420, 0.3],
    [950, 398, 0.2],
    [880, 372, 0.1],
    [826, 352, 0],
    [806, 316, 0],
    [804, 270, 0],
  ],
  [
    [1124, 380, -0.3],
    [1150, 330, -0.2],
    [1212, 296, 0],
    [1248, 236, 0],
    [1252, 190, 0],
  ],
];
const isLive = (i: number) =>
  signal.stage >= 4 || i <= signal.stage || i === signal.focus;
const brightness = (i: number) => {
  if (!isLive(i)) return 0.12;
  const active =
    signal.focus !== null
      ? i === signal.focus
      : signal.stage >= 4 || i === signal.stage;
  return active ? 1 : 0.3;
};

const o = new THREE.Object3D();
const colour = new THREE.Color();

type Lane = {
  lut: Float32Array;
  count: number;
  speed: number;
  size: number;
  level: () => number;
  pale: boolean;
};

function lut(curve: THREE.Curve<THREE.Vector3>) {
  const pts = curve.getSpacedPoints(160);
  const a = new Float32Array(pts.length * 3);
  pts.forEach((p, i) => p.toArray(a, i * 3));
  return a;
}

/** The packets, as one instanced mesh, for every path at once. */
function Packets({ lanes }: { lanes: Lane[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const levels = useRef<number[]>([]);
  const total = useMemo(() => lanes.reduce((n, l) => n + l.count, 0), [lanes]);

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const time = signal.reduced ? 0 : state.clock.elapsedTime;
    let index = 0;
    lanes.forEach((lane, l) => {
      const level = THREE.MathUtils.damp(
        levels.current[l] ?? 0,
        lane.level(),
        4,
        delta,
      );
      levels.current[l] = level;
      const last = lane.lut.length / 3 - 1;
      for (let i = 0; i < lane.count; i++) {
        const t = (time * lane.speed + i / lane.count) % 1;
        const f = t * last;
        const a = Math.floor(f);
        const b = Math.min(last, a + 1);
        const k = f - a;
        for (let c = 0; c < 3; c++) {
          o.position.setComponent(
            c,
            lane.lut[a * 3 + c] * (1 - k) + lane.lut[b * 3 + c] * k,
          );
        }
        const fade = clamp01(t * 12) * clamp01((1 - t) * 12);
        o.scale.setScalar(lane.size * fade * (level > 0.02 ? 1 : 0));
        o.updateMatrix();
        mesh.setMatrixAt(index, o.matrix);
        colour
          .set(lane.pale || i % 3 === 0 ? "#fff7c8" : "#b7ef3a")
          .multiplyScalar(0.4 + level * 1.7);
        mesh.setColorAt(index, colour);
        index++;
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, total]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 10, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

export function Streams() {
  const built = useMemo(() => {
    const main = MAIN.map(path);
    const lanes: Lane[] = main.map((curve, i) => ({
      lut: lut(curve),
      count: 12,
      speed: 0.16,
      size: 0.065,
      // No packets until this pathway has appeared.
      level: () => (phase(2.9 + i * 0.12, 0.6) > 0 ? brightness(i) : 0),
      pale: false,
    }));
    return { main, lanes };
  }, []);

  return (
    <>
      {built.main.map((curve, i) => (
        <GlowTube
          key={i}
          curve={curve}
          radius={0.15}
          fill={0.05}
          rim={0.95}
          reach={() => (phase(2.9 + i * 0.12, 0.6) > 0 ? 1.01 : 0)}
          level={() => 0.45 + brightness(i) * 0.55}
        />
      ))}
      <Packets lanes={built.lanes} />
    </>
  );
}
