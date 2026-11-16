"use client";

import { memo, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  ChartNoAxesColumnIncreasing,
  Cloud,
  CodeXml,
  Focus,
  Layers,
  Leaf,
  type LucideIcon,
  Rocket,
} from "lucide-react";
import {
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { at, onPlane, signal } from "@/components/journey3d/signal";
import { site } from "@/content/site";

const { journey } = site;
type Milestone = (typeof journey)["milestones"][number];

const EASE = [0.32, 0.72, 0, 1] as const;
const LOOP = "motion-reduce:animate-none";
const BOOT_MS = 3500;

// The WebGL scene loads separately, so this page's HTML appears straight away.
const Stage = dynamic(() => import("@/components/journey3d/Stage"), {
  ssr: false,
});

const DESKTOP = "(min-width: 1280px)";
function subscribeDesktop(notify: () => void) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
const useDesktop = () =>
  useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  );

function canUseWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const pinRefs = new Map<string, (el: HTMLElement | null) => void>();

/** Pins an element to a point in the 3D scene while it's mounted. */
function pin(id: string, world: [number, number, number]) {
  let ref = pinRefs.get(id);
  if (!ref) {
    ref = (el) => {
      if (el)
        signal.anchors.set(id, {
          el,
          world,
          x: -9999,
          y: -9999,
          settled: false,
        });
      else signal.anchors.delete(id);
    };
    pinRefs.set(id, ref);
  }
  return ref;
}

// Top-left corners of the cards (design pixels), in milestone order.
const CARD_CORNERS: [number, number][] = [
  [576, 392],
  [1262, 270],
  [628, 170],
  [1116, 78],
];
const CARD_PINS = CARD_CORNERS.map(([x, y]) => onPlane(x, y));

// The four stages, set into the floor plate in front of the GPU.
const DISC_TOP = 0.14;
const RING = [
  {
    word: "RESEARCH",
    sub: "Explore",
    Icon: Focus,
    world: at(806, 660, DISC_TOP),
  },
  {
    word: "BUILD",
    sub: "Develop",
    Icon: Layers,
    world: at(984, 706, DISC_TOP),
  },
  {
    word: "DEPLOY",
    sub: "Deliver",
    Icon: Rocket,
    world: at(1214, 706, DISC_TOP),
  },
  {
    word: "SCALE",
    sub: "Impact",
    Icon: ChartNoAxesColumnIncreasing,
    world: at(1394, 660, DISC_TOP),
  },
];

// Scroll progress at which the career ends and the full system shows.
const CAREER_END = 0.84;

// Positions on the 1717×916 design. Upright, with no transforms at rest, so
// the text is perfectly crisp. `from` is the side its data stream arrives on.
const PLACEMENT: Record<
  string,
  {
    left: string;
    top: string;
    width: string;
    icon: LucideIcon;
    from: "left" | "right";
  }
> = {
  "2022": {
    left: "33.55%",
    top: "42.79%",
    width: "20.50%",
    icon: Layers,
    from: "right",
  },
  "2023": {
    left: "73.50%",
    top: "29.48%",
    width: "23.88%",
    icon: CodeXml,
    from: "left",
  },
  "2024": {
    left: "36.58%",
    top: "18.56%",
    width: "24.46%",
    icon: Cloud,
    from: "right",
  },
  "2025 – Present": {
    left: "65.00%",
    top: "8.52%",
    width: "32.38%",
    icon: Boxes,
    from: "left",
  },
};

const OPEN = "inset(-60px -60px -60px -60px)";
const SHUT = {
  left: "inset(-60px 100% -60px -60px)",
  right: "inset(-60px -60px -60px 100%)",
};

// ---- Holographic card pieces ----

/** Covers the icon with pixels that drop away at random, so it emerges. */
function PixelCover() {
  return (
    <span
      className="absolute inset-[-8%] grid grid-cols-6 grid-rows-6"
      aria-hidden
    >
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={i}
          className="animate-pixel-out bg-[#1f2e13]"
          style={{ animationDelay: `${((i * 7) % 36) * 0.018}s` }}
        />
      ))}
    </span>
  );
}

// A wireframe surface for 2025: peaks of activity across a mesh.
const MESH = (() => {
  const U = 26;
  const V = 9;
  const h = (u: number, v: number) =>
    0.95 * Math.exp(-((u - 0.74) ** 2 / 0.025 + (v - 0.55) ** 2 / 0.16)) +
    0.5 * Math.exp(-((u - 0.46) ** 2 / 0.018 + (v - 0.3) ** 2 / 0.09)) +
    0.18 * u;
  const point = (u: number, v: number) =>
    `${(34 + u * 180 - v * 30).toFixed(1)} ${(84 - v * 24 - h(u, v) * 46).toFixed(1)}`;
  const rows = Array.from({ length: V }, (_, j) =>
    Array.from({ length: U + 1 }, (_, i) => point(i / U, j / (V - 1))),
  ).map((pts) => `M${pts.join("L")}`);
  const cols = Array.from({ length: U + 1 }, (_, i) =>
    Array.from({ length: V }, (_, j) => point(i / U, j / (V - 1))),
  ).map((pts) => `M${pts.join("L")}`);
  return { rows, cols };
})();

function StatusGraphic({ item, active }: { item: Milestone; active: boolean }) {
  if (item.art === "wave") {
    return (
      <svg
        viewBox="0 0 220 90"
        preserveAspectRatio="none"
        fill="none"
        className="absolute right-0 bottom-0 h-[86%] w-[48%] [mask-image:linear-gradient(90deg,transparent,#000_35%)]"
        aria-hidden
      >
        {[...MESH.rows, ...MESH.cols].map((d) => (
          <path
            key={d}
            d={d}
            stroke="#a8dc45"
            strokeOpacity={active ? 0.6 : 0.35}
            strokeWidth={0.7}
            vectorEffect="non-scaling-stroke"
            style={{ transition: "stroke-opacity 0.6s ease" }}
          />
        ))}
        {/* Signals running along the mesh */}
        {MESH.rows
          .slice(1)
          .map((d, i) =>
            i % 2 ? null : (
              <path
                key={`run-${d}`}
                d={d}
                pathLength={1000}
                stroke="#f2ffbe"
                strokeWidth={1.4}
                strokeDasharray="70 930"
                vectorEffect="non-scaling-stroke"
                className={`animate-flow [animation-duration:4.5s] ${LOOP}`}
                style={{ animationDelay: `${-i * 0.6}s` }}
              />
            ),
          )}
      </svg>
    );
  }

  if (item.art === "pixels") {
    // Object detection: the box locks on to the car.
    return (
      <svg
        viewBox="0 0 100 64"
        className="h-14 w-[5.6rem] flex-none self-center xl:h-[3.7cqw] xl:w-[5.8cqw]"
        fill="none"
        aria-hidden
      >
        <rect x={2} y={2} width={96} height={60} rx={5} fill="#1d2d10" />
        <path d="M2 50H98" stroke="#3d5a1c" />
        <path
          d="M18 46L22 36Q25 32 32 31L40 24Q44 21 51 21H63Q69 21 73 26L78 31Q86 32 88 37V46Z"
          fill="#c9f751"
        />
        <path
          d="M43 30L49 25H58V30ZM61 25H65Q68 25 70 28L71 30H61Z"
          fill="#1d2d10"
        />
        <circle
          cx={32}
          cy={46}
          r={5.5}
          fill="#1d2d10"
          stroke="#c9f751"
          strokeWidth={2}
        />
        <circle
          cx={74}
          cy={46}
          r={5.5}
          fill="#1d2d10"
          stroke="#c9f751"
          strokeWidth={2}
        />
        <g
          className={`animate-lock ${LOOP}`}
          style={{ transformOrigin: "52px 34px", transformBox: "view-box" }}
          stroke="#f2ffbe"
          strokeWidth={1.6}
        >
          <path d="M12 22V14H20M80 14H88V22M88 48V56H80M20 56H12V48" />
        </g>
        <text
          x={13}
          y={11}
          fill="#d9fb85"
          fontSize={6.5}
          fontFamily="monospace"
        >
          car 0.97
        </text>
      </svg>
    );
  }

  if (item.art === "bars") {
    // 2024: layers of the stack settling into place, one after another.
    return (
      <svg
        viewBox="0 0 100 80"
        className="h-16 w-20 flex-none self-center xl:h-[4.6cqw] xl:w-[5.6cqw]"
        fill="none"
        aria-hidden
      >
        {[58, 42, 26].map((y, i) => (
          <polygon
            key={y}
            points={`50,${y - 13} 88,${y} 50,${y + 13} 12,${y}`}
            fill="#c9f751"
            fillOpacity={0.3 + i * 0.25}
            stroke="#f2ffbe"
            strokeWidth={1.2}
            className={`animate-stack ${LOOP}`}
            style={{ animationDelay: `${i * 0.35}s` }}
          />
        ))}
      </svg>
    );
  }

  const heights = [16, 28, 40, 56, 74, 100];
  return (
    <div
      className="flex h-14 w-[4.8rem] flex-none items-end gap-[8%] self-end xl:h-[3.6cqw] xl:w-[4.6cqw]"
      aria-hidden
    >
      {heights.map((h, i) => (
        <span
          key={h}
          className="relative flex-1 bg-[#6d8f35]/35"
          style={{ height: `${h}%` }}
        >
          <span
            className="absolute inset-0 origin-bottom bg-[#c9f751]"
            style={{
              transform: `scaleY(${active ? 1 : 0.45})`,
              transition: `transform 0.6s cubic-bezier(0.32,0.72,0,1) ${i * 0.07}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}

/** A tiny working picture of that year's technical work. */
function DepthVisual({ art }: { art: string }) {
  const draw = (delay: number) => ({
    pathLength: 1,
    strokeDasharray: "1 1",
    className: `animate-draw [animation-duration:3s] ${LOOP}`,
    style: { animationDelay: `${delay}s` },
  });

  return (
    <svg
      viewBox="0 0 220 44"
      fill="none"
      className="mt-2 h-10 w-full xl:mt-[0.5cqw] xl:h-[2.6cqw]"
      aria-hidden
    >
      {art === "pixels" && (
        <>
          {/* Object detection: boxes locking on to shapes */}
          <circle cx={36} cy={24} r={11} fill="#6d8f35" />
          <rect x={88} y={11} width={30} height={26} rx={2} fill="#6d8f35" />
          <path d="M170 37L186 9L202 37Z" fill="#6d8f35" />
          <rect
            x={20}
            y={8}
            width={32}
            height={32}
            stroke="#effda9"
            strokeWidth={1.4}
            {...draw(0)}
          />
          <rect
            x={83}
            y={6}
            width={40}
            height={36}
            stroke="#effda9"
            strokeWidth={1.4}
            {...draw(0.3)}
          />
          <rect
            x={164}
            y={4}
            width={44}
            height={36}
            stroke="#effda9"
            strokeWidth={1.4}
            {...draw(0.6)}
          />
        </>
      )}
      {art === "stairs" && (
        <>
          {/* Analytics: series plotted across a chart */}
          <path d="M4 40H216" stroke="#7fa23b" />
          <path
            d="M6 36L40 26L74 30L108 16L142 20L176 8L214 4"
            stroke="#effda9"
            strokeWidth={1.8}
            {...draw(0)}
          />
          <path
            d="M6 40L40 34L74 37L108 28L142 32L176 22L214 18"
            stroke="#a8dc45"
            strokeWidth={1.4}
            {...draw(0.35)}
          />
        </>
      )}
      {art === "bars" && (
        <>
          {/* A production pipeline, stage by stage */}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={6 + i * 56}
              y={12}
              width={40}
              height={20}
              rx={4}
              stroke="#7fa23b"
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={`on-${i}`}
              x={6 + i * 56}
              y={12}
              width={40}
              height={20}
              rx={4}
              fill="#c9f751"
              className={`animate-surge [animation-duration:2.4s] ${LOOP}`}
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
          <path
            d="M46 22H62M102 22H118M158 22H174"
            stroke="#effda9"
            strokeWidth={1.4}
          />
        </>
      )}
      {art === "wave" && (
        <>
          {/* Distributed agents passing work around a mesh */}
          <path
            d="M20 22L70 8L120 34L170 10L204 26M70 8L120 10L170 10M20 22L120 34L204 26"
            stroke="#7fa23b"
          />
          <path
            d="M20 22L70 8L120 34L170 10L204 26"
            stroke="#effda9"
            strokeWidth={1.8}
            {...draw(0)}
          />
          {[
            [20, 22],
            [70, 8],
            [120, 34],
            [120, 10],
            [170, 10],
            [204, 26],
          ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={4} fill="#c9f751" />
          ))}
        </>
      )}
    </svg>
  );
}

/** A line that types itself out, terminal-style. */
function TerminalLine({
  text,
  delay,
  className,
}: {
  text: string;
  delay: number;
  className: string;
}) {
  return (
    <p
      className={`animate-type font-mono ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationTimingFunction: `steps(${text.length}, end)`,
      }}
    >
      {text}
    </p>
  );
}

function CardBody({
  item,
  active,
  locked,
  revealed,
  onHover,
}: {
  item: Milestone;
  active: boolean;
  locked: boolean;
  revealed: boolean;
  onHover?: (on: boolean) => void;
}) {
  const Icon = PLACEMENT[item.year].icon;
  const lit = active || revealed;
  const [touches, setTouches] = useState(0);

  return (
    <article
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        setTouches((n) => n + 1);
        onHover?.(true);
      }}
      onPointerLeave={(e) => e.pointerType === "mouse" && onHover?.(false)}
      className={`relative rounded-[18px] border-[1.5px] bg-linear-to-br from-[#3d5a1c]/85 via-[#1d2d10]/90 to-[#121f0a]/92 text-white transition-[border-color,box-shadow,opacity] duration-500 ease-apple xl:rounded-[1.25cqw] ${
        lit
          ? "border-[#e6ffa0] shadow-[0_0_30px_rgb(180_240_60/0.5),inset_0_1px_0_rgb(255_255_255/0.22),inset_0_0_26px_rgb(180_240_60/0.14)]"
          : "border-[#c9f07c]/70 shadow-[0_0_16px_rgb(180_240_60/0.25),inset_0_1px_0_rgb(255_255_255/0.15)]"
      } ${locked ? "opacity-75" : ""}`}
    >
      {/* Border drawn progressively, each time this card is activated */}
      {lit && (
        <svg
          key={`trace-${touches}-${active}`}
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          fill="none"
          aria-hidden
        >
          <rect
            width="100%"
            height="100%"
            rx={20}
            pathLength={1}
            stroke="#fbffd6"
            strokeWidth={2.5}
            strokeDasharray="1 1"
            className={`animate-trace ${LOOP}`}
          />
        </svg>
      )}

      <div className="relative flex items-center gap-3 overflow-hidden rounded-t-[inherit] px-4 py-5 xl:gap-[0.95cqw] xl:py-[1.25cqw] xl:pr-[1cqw] xl:pl-[1.2cqw]">
        {item.art === "wave" && <StatusGraphic item={item} active={active} />}
        <span className="relative size-10 flex-none xl:size-[2.7cqw]">
          <Icon
            className="size-full text-[#c9f751]"
            strokeWidth={1.5}
            aria-hidden
          />
          {lit && <PixelCover key={`pixels-${touches}-${active}`} />}
        </span>
        <div
          className={`relative min-w-0 flex-1 ${item.art === "wave" ? "max-w-[60%] xl:max-w-[58%]" : ""}`}
        >
          <h2 className="text-[1.15rem] leading-tight font-semibold xl:text-[1.1cqw] xl:whitespace-nowrap">
            {item.title}
          </h2>
          <p className="mt-1 text-[0.95rem] leading-snug text-[#eaf1d9] xl:mt-[0.3cqw] xl:text-[0.86cqw]">
            {item.detail}
          </p>
        </div>
        {item.art !== "wave" && <StatusGraphic item={item} active={active} />}
      </div>

      {/* The deep dive: what was actually built that year */}
      <div
        className="grid transition-[grid-template-rows] duration-500 ease-apple"
        style={{ gridTemplateRows: revealed ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {revealed && (
            <div className="border-t border-[#c9f07c]/25 px-4 pt-3 pb-4 xl:px-[1.2cqw] xl:pt-[0.7cqw] xl:pb-[0.9cqw]">
              <TerminalLine
                text={`> ${item.impact}`}
                delay={0.25}
                className="text-[0.85rem] font-semibold text-[#d9fb85] xl:text-[0.74cqw]"
              />
              <TerminalLine
                text={`$ ${item.tools.join(" · ")}`}
                delay={0.95}
                className="mt-1 text-[0.8rem] text-[#f1f6e2] xl:text-[0.68cqw]"
              />
              <DepthVisual art={item.art} />
            </div>
          )}
        </div>
      </div>

      {/* A thin scan passes through on hover */}
      {revealed && (
        <span
          key={`scan-${touches}`}
          className={`pointer-events-none absolute inset-x-0 h-[2px] animate-card-scan bg-[#f6ffc4] shadow-[0_0_14px_3px_rgb(200_245_90/0.7)] ${LOOP} motion-reduce:hidden`}
          aria-hidden
        />
      )}

      <span className="absolute -top-3.5 left-[15%] rounded-full border-[1.5px] border-[#d9f98c] bg-linear-to-b from-[#5b8423] to-[#34541a] px-3.5 py-0.5 text-[0.9rem] font-semibold text-white xl:-top-[1cqw] xl:px-[0.95cqw] xl:py-[0.12cqw] xl:text-[0.98cqw]">
        {item.year}
      </span>
    </article>
  );
}

// ---- The story on the left ----

function wipe(delay: number, start: boolean) {
  return {
    initial: { clipPath: "inset(-10% 100% -10% 0)" },
    animate: start ? { clipPath: "inset(-10% -5% -10% 0)" } : undefined,
    transition: { duration: 0.9, ease: EASE, delay },
  };
}

const WORD_GAP = 0.028;
const PARAGRAPH_WORDS = journey.paragraphs.map((text, p) => {
  const before = journey.paragraphs
    .slice(0, p)
    .reduce((sum, t) => sum + t.split(" ").length, 0);
  return text.split(" ").map((word, i) => ({ word, index: before + i }));
});
const TOTAL_WORDS = PARAGRAPH_WORDS.flat().length;

const Story = memo(function Story({ start }: { start: boolean }) {
  return (
    <>
      <motion.span
        {...wipe(0.35, start)}
        className="inline-flex items-center gap-2.5 rounded-full border border-accent/40 bg-[#fffdf5]/70 px-5 py-2 font-medium xl:gap-[0.55cqw] xl:px-[1.2cqw] xl:py-[0.5cqw] xl:text-[1cqw]"
      >
        <Leaf
          className="size-5 fill-accent text-accent xl:size-[1.3cqw]"
          aria-hidden
        />
        {journey.eyebrow}
      </motion.span>

      <h1 className="mt-7 font-serif text-[clamp(2.3rem,6.6vw,3.6rem)] leading-[1.08] font-medium tracking-[-0.018em] xl:mt-[1.25cqw] xl:text-[2.62cqw] xl:leading-[1.19] xl:whitespace-nowrap">
        <span className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            animate={start ? { y: 0 } : undefined}
            transition={{ duration: 0.95, ease: EASE, delay: 0.45 }}
          >
            {journey.heading.lineOne}
          </motion.span>
        </span>
        <span className="block overflow-hidden pb-[0.14em]">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            animate={start ? { y: 0 } : undefined}
            transition={{ duration: 0.95, ease: EASE, delay: 0.57 }}
          >
            {journey.heading.lead}{" "}
            {/* The green sweeps through the words like ink */}
            <motion.em
              className="bg-[linear-gradient(90deg,var(--accent)_50%,var(--ink)_50%)] bg-[length:200%_100%] bg-clip-text pr-[0.08em] text-transparent"
              initial={{ backgroundPosition: "100% 0" }}
              animate={start ? { backgroundPosition: "0% 0" } : undefined}
              transition={{ duration: 1.2, ease: EASE, delay: 1.1 }}
            >
              {journey.heading.emphasis}
            </motion.em>
          </motion.span>
        </span>
      </h1>

      <svg
        viewBox="0 0 400 10"
        preserveAspectRatio="none"
        fill="none"
        className="-mt-1 ml-[32%] block h-2.5 w-[52%] xl:ml-[9.7cqw] xl:h-[0.5cqw] xl:w-[16cqw]"
        aria-hidden
      >
        <motion.path
          d="M0 7 Q200 2 400 7"
          stroke="#7f9548"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={start ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.1, ease: EASE, delay: 1.5 }}
        />
      </svg>

      <div className="relative mt-6 pl-6 xl:mt-[1.55cqw] xl:w-[27.6cqw] xl:pl-[1.55cqw]">
        {/* The bar fills at the same pace the words arrive */}
        <motion.span
          className="absolute inset-y-0 left-0 w-[3px] origin-top rounded-full bg-accent"
          initial={{ scaleY: 0 }}
          animate={start ? { scaleY: 1 } : undefined}
          transition={{
            duration: TOTAL_WORDS * WORD_GAP + 0.3,
            ease: "linear",
            delay: 1.15,
          }}
          aria-hidden
        />
        {PARAGRAPH_WORDS.map((paragraph, p) => (
          <p
            key={p}
            className="mt-4 text-[1.05rem] leading-[1.6] first:mt-0 xl:mt-[0.95cqw] xl:text-[0.97cqw] xl:leading-[1.42]"
          >
            {paragraph.map(({ word, index }) => (
              <span key={index}>
                <span
                  className={start ? "animate-word" : "opacity-[0.08]"}
                  style={{ animationDelay: `${1.15 + index * WORD_GAP}s` }}
                >
                  {word}
                </span>{" "}
              </span>
            ))}
          </p>
        ))}
      </div>
    </>
  );
});

/** The four years, then the full system. Each step jumps the scroll there. */
function Stepper({
  step,
  onPick,
}: {
  step: number;
  onPick: (step: number) => void;
}) {
  const years = journey.milestones;
  return (
    <div className="mt-[2.2cqw] flex items-center gap-[2cqw]">
      <ol className="relative flex gap-[2.3cqw]">
        <span
          className="absolute top-[0.55cqw] right-[0.55cqw] left-[0.55cqw] h-[2px] -translate-y-1/2 bg-[#cfc7b0]"
          aria-hidden
        />
        <span
          className="absolute top-[0.55cqw] left-[0.55cqw] h-[2px] origin-left -translate-y-1/2 bg-accent transition-transform duration-700 ease-apple"
          style={{
            right: "0.55cqw",
            transform: `scaleX(${Math.min(step, 3) / 3})`,
          }}
          aria-hidden
        />
        {years.map((m, i) => (
          <li key={m.year} className="relative">
            <button
              type="button"
              onClick={() => onPick(i)}
              aria-label={`${m.year}: ${m.title}`}
              aria-current={i === step ? "step" : undefined}
              className="group flex flex-col items-center gap-[0.45cqw]"
            >
              <span
                className={`grid size-[1.1cqw] place-items-center rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-500 ease-apple ${
                  i === step
                    ? "border-accent bg-accent shadow-[0_0_0_0.3cqw_rgb(74_94_35/0.22)]"
                    : i < step || step >= 4
                      ? "border-accent bg-[#f7f1e3]"
                      : "border-[#bdb6a0] bg-[#f7f1e3] group-hover:border-accent"
                }`}
              />
              <span
                className={`text-[0.78cqw] font-medium transition-colors duration-500 ${
                  i <= step ? "text-ink" : "text-ink-muted"
                }`}
              >
                {`0${i + 1}`}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => onPick(4)}
        aria-current={step >= 4 ? "step" : undefined}
        className={`-mt-[1.3cqw] inline-flex items-center gap-[0.5cqw] rounded-full border px-[1cqw] py-[0.45cqw] text-[0.82cqw] font-medium transition-[background-color,color,border-color] duration-500 ease-apple ${
          step >= 4
            ? "border-accent bg-accent text-[#fbf8ec]"
            : "border-accent/35 bg-[#fffdf5]/70 text-ink hover:border-accent"
        }`}
      >
        <Layers className="size-[1cqw]" strokeWidth={1.6} aria-hidden />
        Full System
      </button>
    </div>
  );
}

function BackLink({ className }: { className: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 text-ink-soft transition-colors hover:text-accent ${className}`}
    >
      <ArrowLeft className="size-4 xl:size-[1cqw]" aria-hidden /> Back to home
    </Link>
  );
}

// ---- The page ----

const BACKDROP = [
  "radial-gradient(38% 42% at 30% 8%, rgb(255 244 210 / 0.75), transparent 70%)",
  "radial-gradient(34% 38% at 62% 40%, rgb(150 215 40 / 0.2), transparent 75%)",
  "linear-gradient(90deg, #f8f1e4 0%, #f2ead9 28%, #c9c4a8 35%, #6e7554 40%, #2a3819 46%, #131e0c 58%, #0c1409 100%)",
].join(",");

/** 0–3 for each year as you scroll, then 4 for the full system. */
function readProgress(p: number) {
  if (p < CAREER_END) return Math.min(3, Math.floor((p / CAREER_END) * 4));
  return 4;
}

export function JourneyView() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollStage, setStage] = useState(0);
  const [booted, setBooted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Runs on every scroll event, so it only touches React when something
  // visible in the HTML actually changes. The 3D scene reads the raw value.
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setStage(readProgress(p));
  });

  // The stepper jumps the scroll to the middle of a year, or to the end.
  const goTo = (step: number) => {
    const track = trackRef.current;
    if (!track) return;
    const range = track.offsetHeight - window.innerHeight;
    const p = step >= 4 ? 0.96 : ((step + 0.5) / 4) * CAREER_END;
    window.scrollTo({ top: track.offsetTop + range * p });
  };

  const desktop = useDesktop();
  const stage = booted ? scrollStage : -1;
  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const [waited, setWaited] = useState(false);
  const ready = sceneReady || waited || (mounted && !webgl);

  // Never hold the page behind the veil for long on a slow machine.
  useEffect(() => {
    const timer = window.setTimeout(() => setWaited(true), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  // WebGL can only be checked in the browser. If it's missing the page still
  // works: the cards stay at their design positions over the plain backdrop.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      signal.reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      setWebgl(canUseWebGL());
      setMounted(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // The boot sequence starts when the scene draws its first frame.
  useEffect(() => {
    if (!sceneReady && webgl) return;
    if (!mounted) return;
    const timer = window.setTimeout(
      () => setBooted(true),
      signal.reduced || !webgl ? 0 : BOOT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [sceneReady, webgl, mounted]);

  // On small screens there's no scroll stage; the years simply play through.
  const [played, setPlayed] = useState(-1);
  useEffect(() => {
    if (!booted) return;
    const timer = window.setInterval(
      () => setPlayed((n) => (n >= 4 ? 0 : n + 1)),
      2600,
    );
    return () => window.clearInterval(timer);
  }, [booted]);

  // Hand the current state to the 3D scene.
  useEffect(() => {
    signal.compact = !desktop;
    signal.stage = desktop ? stage : played;
    signal.focus = hoveredCard;
  }, [desktop, stage, played, hoveredCard]);

  return (
    <MotionConfig reducedMotion="user">
      {/* Continues the green card that expanded on the home page. */}
      <div
        className={`pointer-events-none fixed inset-0 z-50 bg-[#3a4f19] ${ready ? "animate-veil" : ""}`}
        aria-hidden
      />

      <main>
        {/* Desktop: a tall track scrolls while the control room stays pinned */}
        <div ref={trackRef} className="relative hidden h-[420vh] xl:block">
          <div
            className="sticky top-0 h-dvh overflow-hidden"
            style={{ background: BACKDROP }}
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse") return;
              signal.pointerX = e.clientX / window.innerWidth - 0.5;
              signal.pointerY = e.clientY / window.innerHeight - 0.5;
            }}
          >
            {mounted && webgl && desktop && (
              <div className="absolute inset-0">
                <Stage compact={false} onReady={() => setSceneReady(true)} />
              </div>
            )}

            <div className="@container absolute top-0 left-0 h-full w-[min(100%,calc(100dvh*1.875))]">
              {RING.map(({ word, sub, Icon, world }, i) => {
                const lit = stage >= 4 || stage === i;
                return (
                  <div
                    key={word}
                    ref={pin(`ring-${i}`, world)}
                    className="absolute"
                    aria-hidden
                  >
                    <div
                      className={`flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center transition-[opacity,color,filter] duration-700 ease-apple ${
                        sceneReady ? "" : "opacity-0"
                      } ${
                        lit
                          ? "text-[#f0ffb8] drop-shadow-[0_0_10px_rgb(200_245_90/0.75)]"
                          : "text-[#c9e98a] opacity-60"
                      }`}
                      style={{
                        transitionDelay:
                          sceneReady && !booted ? `${2.7 + i * 0.2}s` : "0s",
                      }}
                    >
                      <Icon
                        className="mb-[0.35cqw] size-[2cqw] text-[#c9f751]"
                        strokeWidth={1.6}
                      />
                      <span className="text-[0.95cqw] font-bold tracking-[0.04em]">
                        {word}
                      </span>
                      <span className="text-[0.82cqw] text-[#dfe8c8]/80">
                        {sub}
                      </span>
                    </div>
                  </div>
                );
              })}

              {journey.milestones.map((item, i) => {
                const { left, top, width, from } = PLACEMENT[item.year];
                const isHovered = hoveredCard === i;
                return (
                  <div
                    key={item.year}
                    ref={pin(`card-${i}`, CARD_PINS[i])}
                    className={`absolute ${isHovered ? "z-20" : "z-10"}`}
                    style={{ left, top, width }}
                  >
                    <motion.div
                      initial={{ clipPath: SHUT[from], opacity: 0 }}
                      animate={{
                        clipPath: booted ? OPEN : SHUT[from],
                        opacity: booted ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: EASE,
                        delay: booted ? i * 0.12 : 0,
                      }}
                    >
                      <CardBody
                        item={item}
                        active={stage >= 4 || i === stage}
                        locked={i > stage && !isHovered}
                        revealed={isHovered}
                        onHover={(on) => setHoveredCard(on ? i : null)}
                      />
                    </motion.div>
                  </div>
                );
              })}

              <BackLink className="absolute top-[2.6%] left-[3.2%] text-[0.95cqw]" />
              <div className="absolute top-[7.6%] left-[3.38%]">
                <Story start={ready} />
                <Stepper step={Math.max(0, stage)} onPick={goTo} />
              </div>
            </div>
          </div>
        </div>

        {/* Phones and tablets: the same story, stacked */}
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 xl:hidden">
          <BackLink className="mb-6" />
          <div>
            <Story start={ready} />
          </div>
          <div className="mt-10 overflow-hidden rounded-[32px] bg-[#111a0b]">
            <div className="relative aspect-[560/600] overflow-hidden">
              {mounted && webgl && !desktop && (
                <Stage compact onReady={() => setSceneReady(true)} />
              )}
            </div>
            <div className="grid gap-7 px-4 pt-4 pb-8 sm:grid-cols-2 sm:px-6">
              {journey.milestones.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ clipPath: "inset(-30px 100% -30px -30px)" }}
                  whileInView={{ clipPath: "inset(-30px -30px -30px -30px)" }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
                >
                  <CardBody
                    item={item}
                    active={played >= 4 || i === played}
                    locked={false}
                    revealed
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </MotionConfig>
  );
}
