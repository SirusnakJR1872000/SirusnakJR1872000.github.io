"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  DECK,
  hdr,
  LIME,
  phase,
  scanHeight,
} from "@/components/journey3d/shared";
import { signal } from "@/components/journey3d/signal";

// The chip rests on the top glass layer.
const GPU_Y = DECK + 0.95;
const SCALE = 1.12;

/** One exploded layer: appears as the scan reaches it, then closes down. */
function Layer({
  y,
  index,
  children,
}: {
  y: number;
  index: number;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const gap = (index + 1) * 0.72;
    const closing = phase(1.75 + index * 0.1, 1.05);
    const height = y + gap * (1 - closing);
    ref.current.position.y = height;
    ref.current.visible = scanHeight() < GPU_Y + height * SCALE + 0.6;
  });
  return <group ref={ref}>{children}</group>;
}

function pinGeometry() {
  const foot = new THREE.BoxGeometry(0.075, 0.03, 0.26);
  foot.translate(0, -0.2, 0.2);
  const leg = new THREE.BoxGeometry(0.075, 0.22, 0.03);
  leg.translate(0, -0.1, 0.075);
  const arm = new THREE.BoxGeometry(0.075, 0.03, 0.18);
  arm.translate(0, 0, 0);
  return mergeGeometries([foot, leg, arm])!;
}

function Pins() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => pinGeometry(), []);
  const PER_SIDE = 24;

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh || mesh.userData.done) return;
    const o = new THREE.Object3D();
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < PER_SIDE; i++) {
        const along = -1.32 + (i / (PER_SIDE - 1)) * 2.64;
        const angle = (side * Math.PI) / 2;
        o.position.set(
          Math.cos(angle) * along + Math.sin(angle) * 1.56,
          -0.02,
          -Math.sin(angle) * along + Math.cos(angle) * 1.56,
        );
        o.rotation.y = angle;
        o.updateMatrix();
        mesh.setMatrixAt(side * PER_SIDE + i, o.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.done = true;
  });

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, PER_SIDE * 4]}>
      <meshStandardMaterial color="#b9a659" metalness={0.85} roughness={0.42} />
    </instancedMesh>
  );
}

/** Real extruded "AI" lettering. */
function Letters() {
  const geometry = useMemo(() => {
    const a = new THREE.Shape()
      .moveTo(-0.5, 0)
      .lineTo(-0.13, 0.9)
      .lineTo(0.13, 0.9)
      .lineTo(0.5, 0)
      .lineTo(0.3, 0)
      .lineTo(0.22, 0.2)
      .lineTo(-0.22, 0.2)
      .lineTo(-0.3, 0)
      .closePath();
    a.holes.push(
      new THREE.Path()
        .moveTo(-0.15, 0.37)
        .lineTo(0.15, 0.37)
        .lineTo(0, 0.74)
        .closePath(),
    );
    const i = new THREE.Shape()
      .moveTo(0.68, 0)
      .lineTo(0.87, 0)
      .lineTo(0.87, 0.9)
      .lineTo(0.68, 0.9)
      .closePath();
    const g = new THREE.ExtrudeGeometry([a, i], {
      depth: 0.05,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 2,
    });
    g.translate(-0.185, -0.45, 0);
    return g;
  }, []);
  const colour = useMemo(() => hdr(LIME, 1.2), []);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, -0.16]}
      scale={0.92}
    >
      <meshBasicMaterial color={colour} toneMapped={false} />
    </mesh>
  );
}

function Engraving() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 128;
    const x = c.getContext("2d")!;
    x.fillStyle = "#fff";
    x.font = "700 54px Arial, Helvetica, sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText("BUILD · TRAIN · DEPLOY · SCALE", 512, 66);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const colour = useMemo(() => hdr("#dff58e", 1.05), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.5]}>
      <planeGeometry args={[1.9, 0.235]} />
      <meshBasicMaterial
        map={texture}
        color={colour}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Heat across the lid, following the active year. */
function Thermal() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uCool: { value: 0.2 },
      uCore: { value: 0 },
      uMesh: { value: 0 },
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const s = signal.focus ?? signal.stage;
    const cool = [0.15, 0.4, 0.7, 0.5, 0.55, 0.8][s + 1];
    const core = [0, 0, 0.2, 1, 0.45, 0.8][s + 1];
    const net = [0, 0, 0, 0.05, 1, 1][s + 1];
    const d = THREE.MathUtils.damp;
    m.uniforms.uCool.value = d(m.uniforms.uCool.value, cool, 2.5, delta);
    m.uniforms.uCore.value = d(m.uniforms.uCore.value, core, 2.5, delta);
    m.uniforms.uMesh.value = d(m.uniforms.uMesh.value, net, 2.5, delta);
    m.uniforms.uTime.value = signal.reduced ? 0 : signal.time;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
      <planeGeometry args={[2.24, 2.24]} />
      <shaderMaterial
        ref={ref}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={
          /* glsl */ `
          varying vec2 vP;
          void main() {
            vP = uv * 2.0 - 1.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`
        }
        fragmentShader={
          /* glsl */ `
          uniform float uCool, uCore, uMesh, uTime;
          varying vec2 vP;
          float blob(vec2 c, float r) { return exp(-dot(vP - c, vP - c) / (r * r)); }
          float bar(vec2 a, vec2 b) {
            vec2 pa = vP - a, ba = b - a;
            float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
            float d = length(pa - ba * h) / 0.05;
            return exp(-d * d);
          }
          void main() {
            vec3 cool = vec3(0.05, 0.12, 0.02);
            vec3 hot = vec3(0.95, 1.0, 0.45);
            float pulse = 0.82 + 0.18 * sin(uTime * 1.6);
            vec3 c = cool * uCool * blob(vec2(0.0), 1.05);
            c += hot * uCore * pulse * 0.42 * blob(vec2(0.0), 0.38);
            vec2 p[4];
            p[0] = vec2(-0.6, -0.6); p[1] = vec2(0.6, -0.6);
            p[2] = vec2(0.6, 0.6); p[3] = vec2(-0.6, 0.6);
            float net = 0.0;
            for (int i = 0; i < 4; i++) {
              float t = 0.75 + 0.25 * sin(uTime * 2.2 + float(i) * 1.57);
              net += t * blob(p[i], 0.22) * 0.8;
              net += t * bar(vec2(0.0), p[i]) * 0.3;
            }
            c += hot * uMesh * net * 0.34;
            float edge = smoothstep(1.0, 0.86, max(abs(vP.x), abs(vP.y)));
            gl_FragColor = vec4(c * edge, 1.0);
          }`
        }
      />
    </mesh>
  );
}

export function Gpu() {
  return (
    <group
      position={[0, GPU_Y, 0]}
      rotation={[0, Math.PI / 4, 0]}
      scale={SCALE}
    >
      <Layer y={0} index={0}>
        <RoundedBox args={[3, 0.13, 3]} radius={0.03} smoothness={2}>
          <meshStandardMaterial
            color="#10190c"
            metalness={0.45}
            roughness={0.42}
          />
        </RoundedBox>
        <Pins />
      </Layer>
      <Layer y={0.13} index={1}>
        <RoundedBox args={[2.76, 0.13, 2.76]} radius={0.03} smoothness={2}>
          <meshStandardMaterial
            color="#0c120a"
            metalness={0.75}
            roughness={0.5}
          />
        </RoundedBox>
      </Layer>
      <Layer y={0.26} index={2}>
        <RoundedBox args={[2.46, 0.13, 2.46]} radius={0.04} smoothness={3}>
          <meshStandardMaterial color="#b7b49c" metalness={1} roughness={0.3} />
        </RoundedBox>
      </Layer>
      <Layer y={0.39} index={3}>
        <RoundedBox args={[2.3, 0.14, 2.3]} radius={0.05} smoothness={3}>
          <meshStandardMaterial
            color="#20261b"
            metalness={0.92}
            roughness={0.2}
          />
        </RoundedBox>
        <group position={[0, 0.071, 0]}>
          <Thermal />
          <Letters />
          <Engraving />
        </group>
      </Layer>
    </group>
  );
}
