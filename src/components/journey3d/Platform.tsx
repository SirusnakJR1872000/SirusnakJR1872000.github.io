"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  DECK,
  DISC,
  glassMaterial,
  GOLD,
  LOWER,
  scanHeight,
  UPPER,
  hdr,
  LIME,
  PALE,
  phase,
} from "@/components/journey3d/shared";
import { signal } from "@/components/journey3d/signal";

const TURN = Math.PI / 4;

/** Builds into place from above as the scan reaches it. */
function Stacked({
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
    const closing = phase(1.5 + index * 0.13, 1.05);
    const height = y + (index + 1) * 0.6 * (1 - closing);
    ref.current.position.y = height;
    ref.current.visible = scanHeight() < height + 0.6;
  });
  return <group ref={ref}>{children}</group>;
}

function Glow({
  args,
  position,
  rotation = 0,
  colour = LIME,
  power = 1.8,
}: {
  args: [number, number, number];
  position: [number, number, number];
  rotation?: number;
  colour?: string;
  power?: number;
}) {
  const c = useMemo(() => hdr(colour, power), [colour, power]);
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <boxGeometry args={args} />
      <meshBasicMaterial color={c} toneMapped={false} />
    </mesh>
  );
}

/** The large round floor plate with lit rims. */
function Disc() {
  const rim = useMemo(() => hdr(LIME, 1.6), []);
  const inner = useMemo(() => hdr(LIME, 0.9), []);
  return (
    <group position={[0, 0, DISC.z]}>
      <mesh position={[0, DISC.top / 2, 0]}>
        <cylinderGeometry
          args={[DISC.radius, DISC.radius + 0.08, DISC.top, 128]}
        />
        <meshStandardMaterial color="#141b0f" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DISC.top + 0.01, 0]}>
        <torusGeometry args={[DISC.radius - 0.05, 0.026, 8, 160]} />
        <meshBasicMaterial color={rim} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DISC.top + 0.004, 0]}>
        <ringGeometry args={[DISC.radius - 0.75, DISC.radius - 0.73, 160]} />
        <meshBasicMaterial color={inner} toneMapped={false} />
      </mesh>
      {/* Light pooled on the plate around the base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DISC.top + 0.006, 0]}>
        <circleGeometry args={[DISC.radius - 0.06, 96]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={
            /* glsl */ `varying vec2 vP; void main(){ vP = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
          }
          fragmentShader={
            /* glsl */ `
            varying vec2 vP;
            void main() {
              float r = length(vP);
              float q = r / 0.62;
              float pool = exp(-q * q) * 0.22 + smoothstep(0.7, 1.0, r) * 0.1;
              gl_FragColor = vec4(vec3(0.55, 0.85, 0.15) * pool, 1.0);
            }`
          }
        />
      </mesh>
    </group>
  );
}

/** Rows of cooling slots on the two faces that look toward the viewer. */
function Vents() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const PER_FACE = 34;
  useFrame(() => {
    const mesh = ref.current;
    if (!mesh || mesh.userData.done) return;
    const o = new THREE.Object3D();
    const half = LOWER.side / 2;
    for (let face = 0; face < 2; face++) {
      for (let i = 0; i < PER_FACE; i++) {
        const along = -half + 0.45 + (i / (PER_FACE - 1)) * (LOWER.side - 0.9);
        if (face === 0) o.position.set(along, 0, half + 0.005);
        else o.position.set(half + 0.005, 0, along);
        o.rotation.y = face === 0 ? 0 : Math.PI / 2;
        o.updateMatrix();
        mesh.setMatrixAt(face * PER_FACE + i, o.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.done = true;
  });
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, PER_FACE * 2]}
      position={[0, LOWER.height * 0.45, 0]}
    >
      <boxGeometry args={[0.05, LOWER.height * 0.46, 0.02]} />
      <meshStandardMaterial color="#05080a" metalness={0.6} roughness={0.6} />
    </instancedMesh>
  );
}

/** The two-tier machined base under the chip. */
function Base() {
  const l = LOWER.side / 2;
  const u = UPPER.side / 2;
  return (
    <>
      <Stacked y={DISC.top} index={0}>
        <group rotation={[0, TURN, 0]}>
          <RoundedBox
            args={[LOWER.side, LOWER.height, LOWER.side]}
            radius={0.07}
            smoothness={3}
            position={[0, LOWER.height / 2, 0]}
          >
            <meshStandardMaterial
              color="#1b2116"
              metalness={0.92}
              roughness={0.32}
            />
          </RoundedBox>
          <Vents />
          {/* Gold markers at the corners, lime light along the top lip */}
          <Glow
            args={[0.5, 0.05, 0.05]}
            position={[-l + 0.6, LOWER.height - 0.06, l + 0.01]}
            colour={GOLD}
            power={2.2}
          />
          <Glow
            args={[0.05, 0.05, 0.5]}
            position={[l + 0.01, LOWER.height - 0.06, -l + 0.6]}
            colour={GOLD}
            power={2.2}
          />
          <Glow
            args={[0.5, 0.05, 0.05]}
            position={[l - 0.6, LOWER.height - 0.06, l + 0.01]}
            colour={GOLD}
            power={2.2}
          />
          <Glow
            args={[LOWER.side - 0.4, 0.035, 0.035]}
            position={[0, LOWER.height + 0.005, l - 0.02]}
            power={1.3}
          />
          <Glow
            args={[0.035, 0.035, LOWER.side - 0.4]}
            position={[l - 0.02, LOWER.height + 0.005, 0]}
            power={1.3}
          />
        </group>
      </Stacked>
      <Stacked y={DISC.top + LOWER.height} index={1}>
        <group rotation={[0, TURN, 0]}>
          <RoundedBox
            args={[UPPER.side, UPPER.height, UPPER.side]}
            radius={0.06}
            smoothness={3}
            position={[0, UPPER.height / 2, 0]}
          >
            <meshStandardMaterial
              color="#262d20"
              metalness={0.95}
              roughness={0.24}
            />
          </RoundedBox>
          <Glow
            args={[UPPER.side - 0.5, 0.04, 0.04]}
            position={[0, UPPER.height + 0.005, u - 0.03]}
            power={2}
          />
          <Glow
            args={[0.04, 0.04, UPPER.side - 0.5]}
            position={[u - 0.03, UPPER.height + 0.005, 0]}
            power={2}
          />
          <Glow
            args={[0.4, 0.04, 0.04]}
            position={[-u + 0.5, UPPER.height * 0.5, u + 0.005]}
            colour={GOLD}
            power={2.4}
          />
        </group>
      </Stacked>
    </>
  );
}

/** Concentric light set into the deck, right under the chip. */
function Pad() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOn: { value: 0 } }),
    [],
  );
  useFrame(() => {
    if (!ref.current) return;
    ref.current.uniforms.uTime.value = signal.reduced ? 0 : signal.time;
    ref.current.uniforms.uOn.value = phase(2.35, 0.6);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DECK + 0.006, 0]}>
      <circleGeometry args={[2.05, 96]} />
      <shaderMaterial
        ref={ref}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={
          /* glsl */ `varying vec2 vP; void main(){ vP = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
        }
        fragmentShader={
          /* glsl */ `
          uniform float uTime, uOn;
          varying vec2 vP;
          void main() {
            float r = length(vP);
            // Rings drift slowly outward from the centre.
            float rings = pow(clamp(0.5 + 0.5 * cos((r * 9.0 - uTime * 0.6) * 6.2832), 0.0, 1.0), 6.0);
            float k = r / 0.42;
            float core = exp(-k * k);
            float edge = smoothstep(1.0, 0.9, r);
            vec3 lime = vec3(0.75, 1.0, 0.25);
            vec3 c = lime * (rings * 0.55 * (1.0 - r) + core * 1.6) + vec3(1.0, 0.85, 0.35) * core * 0.6;
            gl_FragColor = vec4(c * edge * uOn, 1.0);
          }`
        }
      />
    </mesh>
  );
}

/** Glowing glass layers between the base and the chip. */
function GlassLayers() {
  const glass = useMemo(
    () => glassMaterial({ fill: 0.05, rim: 0.7, power: 1.4 }),
    [],
  );
  const edges = useMemo(
    () =>
      [4.1, 3.75].map((s) => {
        const box = new THREE.BoxGeometry(s, 0.12, s);
        return new THREE.EdgesGeometry(box);
      }),
    [],
  );
  const edgeColour = useMemo(() => hdr(LIME, 1.5), []);
  return (
    <>
      {[4.1, 3.75].map((s, i) => (
        <Stacked key={s} y={DECK + 0.16 + i * 0.24} index={2 + i}>
          <group rotation={[0, TURN, 0]}>
            <mesh material={glass}>
              <boxGeometry args={[s, 0.12, s]} />
            </mesh>
            <lineSegments geometry={edges[i]}>
              <lineBasicMaterial color={edgeColour} toneMapped={false} />
            </lineSegments>
          </group>
        </Stacked>
      ))}
    </>
  );
}

/** Light rising from the pad into the chip. */
function Beam() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOn: { value: 0 } }),
    [],
  );
  useFrame(() => {
    if (!ref.current) return;
    ref.current.uniforms.uTime.value = signal.reduced ? 0 : signal.time;
    ref.current.uniforms.uOn.value = phase(2.45, 0.7);
  });
  return (
    <mesh position={[0, DECK + 0.4, 0]}>
      <cylinderGeometry args={[1.25, 1.5, 0.8, 48, 1, true]} />
      <shaderMaterial
        ref={ref}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={
          /* glsl */ `varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
        }
        fragmentShader={
          /* glsl */ `
          uniform float uTime, uOn;
          varying vec2 vU;
          void main() {
            float rise = 0.7 + 0.3 * sin(vU.y * 18.0 - uTime * 4.0);
            float a = pow(clamp(1.0 - vU.y, 0.0, 1.0), 1.2) * 0.3;
            gl_FragColor = vec4(vec3(0.85, 1.0, 0.35) * a * rise * uOn, 1.0);
          }`
        }
      />
    </mesh>
  );
}

/**
 * Light that leaves the base across the floor plate. It pulses once each time
 * a new stage begins, so the platform answers the scroll.
 */
function Ripples() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const colour = useMemo(() => hdr(PALE, 1.2), []);
  const last = useRef({ stage: -9, at: 0 });
  useFrame(() => {
    if (signal.stage !== last.current.stage) {
      last.current = { stage: signal.stage, at: signal.time };
    }
    const since = signal.time - last.current.at;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const t = signal.reduced ? 1 : (since - i * 0.25) / 1.8;
      mesh.visible = t > 0 && t < 1;
      if (!mesh.visible) return;
      mesh.scale.setScalar(0.62 + t * 0.36);
      (mesh.material as THREE.MeshBasicMaterial).opacity =
        phase(2.5, 0.4) * (1 - t) ** 1.6;
    });
  });
  return (
    <>
      {[0, 1].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, DISC.top + 0.012, DISC.z]}
        >
          <ringGeometry args={[DISC.radius - 0.1, DISC.radius - 0.04, 128]} />
          <meshBasicMaterial
            color={colour}
            transparent
            toneMapped={false}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

/** The light plane that sweeps down and reveals each layer at boot. */
function Scan() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const y = scanHeight();
    ref.current.position.y = y;
    ref.current.visible = y > 0 && y < 8;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, TURN]}>
      <planeGeometry args={[6.4, 6.4]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        vertexShader={
          /* glsl */ `varying vec2 vP; void main(){ vP = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
        }
        fragmentShader={
          /* glsl */ `
          varying vec2 vP;
          void main() {
            vec2 g = abs(fract(vP * 8.0) - 0.5);
            float grid = smoothstep(0.46, 0.5, max(g.x, g.y));
            float d = max(abs(vP.x), abs(vP.y));
            float edge = smoothstep(0.96, 1.0, d) * step(d, 1.0);
            vec3 lime = vec3(0.8, 1.0, 0.3);
            gl_FragColor = vec4(lime * (grid * 0.16 + edge * 2.6 + 0.03) * step(d, 1.0), 1.0);
          }`
        }
      />
    </mesh>
  );
}

export function Platform() {
  return (
    <>
      <Scan />
      <Disc />
      <Base />
      <Pad />
      <Beam />
      <GlassLayers />
      <Ripples />
    </>
  );
}
