"use client";

import { useMemo } from "react";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { GOLD, hdr, LIME } from "@/components/journey3d/shared";
import { at } from "@/components/journey3d/signal";

function backdrop() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 1024, 0);
  [
    ["0", "#f8f1e4"],
    ["0.28", "#f2ead9"],
    ["0.35", "#c9c4a8"],
    ["0.4", "#6e7554"],
    ["0.46", "#2a3819"],
    ["0.58", "#131e0c"],
    ["1", "#0c1409"],
  ].forEach(([o, col]) => g.addColorStop(Number(o), col));
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 512);
  const glow = (px: number, py: number, r: number, col: string) => {
    const rg = x.createRadialGradient(px, py, 0, px, py, r);
    rg.addColorStop(0, col);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = rg;
    x.fillRect(0, 0, 1024, 512);
  };
  glow(300, 30, 340, "rgba(255,244,210,0.75)");
  glow(650, 170, 380, "rgba(110,170,20,0.24)");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Fades the desk out toward the cream side and into the dark at the back. */
function deskAlpha() {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const x = c.getContext("2d")!;
  const data = x.createImageData(S, S);
  const smooth = (a: number, b: number, v: number) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  for (let j = 0; j < S; j++) {
    for (let i = 0; i < S; i++) {
      const wx = (i / S - 0.5) * 80;
      const wz = (j / S - 0.5) * 80;
      const a = smooth(-11, -5.4, wx) * smooth(-11, -5, wz) * 255;
      const k = (j * S + i) * 4;
      data.data[k] = data.data[k + 1] = data.data[k + 2] = a;
      data.data[k + 3] = 255;
    }
  }
  x.putImageData(data, 0, 0);
  return new THREE.CanvasTexture(c);
}

function Tile({
  px,
  py,
  w,
  d,
  silver,
}: {
  px: number;
  py: number;
  w: number;
  d: number;
  silver?: boolean;
}) {
  return (
    <RoundedBox
      args={[w, 0.14, d]}
      radius={0.04}
      smoothness={2}
      position={at(px, py, 0.07)}
      rotation={[0, Math.PI / 4, 0]}
    >
      <meshStandardMaterial
        color={silver ? "#d8d2c1" : "#161d11"}
        metalness={silver ? 0.15 : 0.92}
        roughness={silver ? 0.55 : 0.3}
      />
    </RoundedBox>
  );
}

function FloorStrip({
  from,
  to,
  gold,
}: {
  from: [number, number];
  to: [number, number];
  gold?: boolean;
}) {
  const a = new THREE.Vector3(...at(from[0], from[1], 0.03));
  const b = new THREE.Vector3(...at(to[0], to[1], 0.03));
  const length = a.distanceTo(b);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const angle = Math.atan2(-(b.z - a.z), b.x - a.x);
  return (
    <mesh position={mid} rotation={[0, angle, 0]}>
      <boxGeometry args={[length, 0.03, 0.05]} />
      <meshBasicMaterial
        color={hdr(gold ? GOLD : LIME, gold ? 2.2 : 1.7)}
        toneMapped={false}
      />
    </mesh>
  );
}

export function Room({ compact }: { compact: boolean }) {
  const background = useMemo(() => backdrop(), []);
  const alpha = useMemo(() => deskAlpha(), []);

  return (
    <>
      {compact ? (
        <color attach="background" args={["#0e1609"]} />
      ) : (
        <primitive attach="background" object={background} />
      )}

      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#fff3d6"
          position={[-9, 7, 6]}
          scale={[12, 8, 1]}
          target={[0, 2, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#ffffff"
          position={[0, 12, 2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[18, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#b7ef3a"
          position={[9, 3, 5]}
          scale={[3, 8, 1]}
          target={[0, 2, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color="#b7ef3a"
          position={[-6, 1, -6]}
          scale={[10, 2, 1]}
          target={[0, 2, 0]}
        />
      </Environment>

      <directionalLight
        position={[-6, 12, 8]}
        intensity={1.1}
        color="#fff6e0"
      />
      <pointLight
        position={[0, 2.4, 0.4]}
        intensity={16}
        distance={11}
        decay={2}
        color="#c9f751"
      />
      <pointLight
        position={[0, 3.4, 2.4]}
        intensity={7}
        distance={7}
        decay={2}
        color="#eaffb0"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#10170b"
          metalness={0.85}
          roughness={0.32}
          alphaMap={alpha}
          transparent
        />
      </mesh>
      <Tile px={1600} py={600} w={3.2} d={2} />
      <Tile px={1700} py={760} w={3.4} d={2.2} />

      <FloorStrip from={[1520, 560]} to={[1600, 548]} gold />
      <FloorStrip from={[1640, 700]} to={[1717, 690]} />
    </>
  );
}
