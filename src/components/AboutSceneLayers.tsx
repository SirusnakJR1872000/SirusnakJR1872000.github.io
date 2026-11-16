"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

/*
 * Live layers over the About artwork, in the artwork's 759 × 508 pixels. The
 * plane, car and tiles are cut-outs of the original painting; the code, chart,
 * sound wave and vinyl are redrawn so they can move.
 */

const SPRITES = {
  plane: { x: 582.5, y: 49.5, width: 81, height: 30 },
  car: { x: 564.5, y: 308.5, width: 140, height: 87 },
  ai: { x: 155, y: 243, width: 63.5, height: 66.5 },
  code: { x: 98, y: 321, width: 82.5, height: 83.5 },
  polaroid: { x: 591.5, y: 225, width: 92, height: 83 },
};

const anim = "[transform-box:fill-box] motion-reduce:animate-none";
const delay = (seconds: number): CSSProperties => ({
  animationDelay: `${seconds}s`,
});

const KEY = "#e6b94f";
const FN = "#a6c05a";
const TEXT = "#d9e3c4";
const STR = "#e0b58a";
const DIM = "#7d8a6a";

type Token = [color: string, text: string];

const CODE: Token[][] = [
  [[DIM, "# retrieve, answer, verify"]],
  [
    [KEY, "def "],
    [FN, "answer"],
    [TEXT, "(query):"],
  ],
  [
    [TEXT, "  docs = "],
    [FN, "retriever.search"],
    [TEXT, "(query)"],
  ],
  [
    [TEXT, "  prompt = "],
    [FN, "build"],
    [TEXT, "(query, docs)"],
  ],
  [
    [TEXT, "  reply = "],
    [FN, "llm.invoke"],
    [TEXT, "(prompt)"],
  ],
  [
    [KEY, "  return "],
    [FN, "guard"],
    [TEXT, "(reply)"],
  ],
  [],
  [
    [KEY, "for "],
    [TEXT, "batch "],
    [KEY, "in "],
    [TEXT, "loader:"],
  ],
  [
    [TEXT, "  loss = "],
    [FN, "model"],
    [TEXT, "(batch)"],
  ],
  [
    [TEXT, "  loss."],
    [FN, "backward"],
    [TEXT, "()"],
  ],
  [
    [TEXT, "  optim."],
    [FN, "step"],
    [TEXT, "()"],
  ],
  [],
  [
    [FN, "deploy"],
    [TEXT, "(model, "],
    [STR, '"prod"'],
    [TEXT, ")"],
  ],
];
// Where each line starts in the overall typing order.
const LINE_STARTS = CODE.reduce<number[]>(
  (starts, line, row) => [
    ...starts,
    (starts[row - 1] ?? 0) +
      (row ? CODE[row - 1].reduce((sum, [, text]) => sum + text.length, 0) : 0),
  ],
  [],
);
const TOTAL = CODE.flat().reduce((sum, [, text]) => sum + text.length, 0);
// The lit panel in the artwork: top-left, top-right, bottom-right, bottom-left.
const SCREEN: [number, number][] = [
  [82, 190],
  [190, 189],
  [207, 285],
  [101, 291],
];

// Each line is drawn on a 100-unit-wide, 100-unit-tall screen, then mapped onto
// the panel so its baseline and size follow the laptop's real angle.
function lineMatrix(row: number) {
  const v = (10 + row * 6.5) / 100;
  const [tl, tr, br, bl] = SCREEN;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const left = [lerp(tl[0], bl[0], v), lerp(tl[1], bl[1], v)];
  const right = [lerp(tr[0], br[0], v), lerp(tr[1], br[1], v)];
  const across = [(right[0] - left[0]) / 100, (right[1] - left[1]) / 100];
  const down = [
    (lerp(bl[0], br[0], 0.5) - lerp(tl[0], tr[0], 0.5)) / 100,
    (lerp(bl[1], br[1], 0.5) - lerp(tl[1], tr[1], 0.5)) / 100,
  ];
  return [...across, ...down, ...left].map((n) => n.toFixed(3)).join(" ");
}

const TYPE_MS = 48;
const HOLD_MS = 2600;
const BLANK_MS = 900;

/** Code that types itself on a blank laptop screen, then clears and repeats. */
function LaptopCode() {
  const ref = useRef<SVGGElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    // Set after mount so the first render matches the prerendered page.
    if (reduced) {
      const timer = setTimeout(() => setTyped(TOTAL), 0);
      return () => clearTimeout(timer);
    }
    if (!inView) return;
    const timer = setTimeout(
      () => setTyped((n) => (n >= TOTAL ? 0 : n + 1)),
      typed >= TOTAL ? HOLD_MS : typed === 0 ? BLANK_MS : TYPE_MS,
    );
    return () => clearTimeout(timer);
  }, [inView, reduced, typed]);

  // The cursor sits on the last line that has started.
  const cursorRow = LINE_STARTS.findLastIndex(
    (start, row) => CODE[row].length > 0 && start <= typed,
  );

  return (
    <g ref={ref} clipPath="url(#laptop-screen)">
      {CODE.map((line, row) => (
        <text
          key={row}
          transform={`matrix(${lineMatrix(row)})`}
          x="6"
          fontFamily="ui-monospace, Menlo, Consolas, monospace"
          fontSize="4.5"
          style={{ whiteSpace: "pre" }}
        >
          {line.map(([color, text], i) => {
            const offset = line
              .slice(0, i)
              .reduce((sum, [, t]) => sum + t.length, 0);
            const shown = Math.max(typed - LINE_STARTS[row] - offset, 0);
            return (
              <tspan key={i} fill={color}>
                {text.slice(0, shown)}
              </tspan>
            );
          })}
          {row === cursorRow && (
            <tspan
              fill={FN}
              className="animate-caret motion-reduce:animate-none"
            >
              ▌
            </tspan>
          )}
        </text>
      ))}
    </g>
  );
}

const CHART: [x: number, width: number, top: number][] = [
  [219, 6.5, 224.5],
  [227, 6.5, 220],
  [234.5, 6, 214.5],
  [242, 6, 216],
  [249.5, 6, 207.5],
  [257, 6.5, 208],
  [265.5, 6.5, 196],
];
const CHART_BASE = 234.5;

const WAVE = [5, 9, 7, 15, 11, 24, 36, 22, 13, 17, 8, 10, 5];

function Sprite({ name }: { name: keyof typeof SPRITES }) {
  const { x, y, width, height } = SPRITES[name];
  return (
    <image
      href={`/images/scene/${name}.webp`}
      x={x}
      y={y}
      width={width}
      height={height}
    />
  );
}

// The lower half of the glowing ring.
const RING_ARC =
  "M28 262C38 312 108 356 220 380C320 408 470 432 575 415C660 402 746 352 752 286";

export function AboutSceneLayers() {
  return (
    <svg
      viewBox="0 0 759 508"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <clipPath id="laptop-screen">
          <polygon points={SCREEN.map(([x, y]) => `${x},${y}`).join(" ")} />
        </clipPath>
        <radialGradient id="scene-glow">
          <stop offset="0" stopColor="#ffe9b0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffe9b0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <LaptopCode />

      {/* Lamp */}
      <circle
        cx="216"
        cy="158"
        r="46"
        fill="url(#scene-glow)"
        className={`animate-glow origin-center ${anim}`}
      />

      {/* Live chart */}
      {CHART.map(([x, width, top], i) => (
        <rect
          key={x}
          x={x}
          y={top}
          width={width}
          height={CHART_BASE - top}
          fill="#a9c94a"
          className={`animate-eq origin-bottom ${anim}`}
          style={delay(i * 0.2)}
        />
      ))}

      {/* Steam from the mug */}
      {[198, 206, 214].map((x, i) => (
        <path
          key={x}
          d={`M${x} 311c-4 -5 4 -9 0 -14s4 -9 0 -14`}
          fill="none"
          stroke="#fffaf0"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0"
          className={`animate-steam ${anim}`}
          style={delay(i * 0.8)}
        />
      ))}

      {/* Sound wave on the card */}
      <g transform="rotate(3 640 206)">
        {WAVE.map((height, i) => (
          <rect
            key={i}
            x={622 + i * 3}
            y={206 - height / 2}
            width="1.6"
            height={height}
            rx="0.8"
            fill="#fffdf6"
            className={`animate-eq origin-center ${anim}`}
            style={delay(i * 0.12)}
          />
        ))}
      </g>

      {/* Spinning vinyl: moving light and a mark on the label */}
      <g transform="translate(687.5 246)">
        <g
          className={`animate-[spin_3.2s_linear_infinite] origin-center ${anim}`}
        >
          <circle r="41" fill="none" />
          <path d="M0 0L12 -39A41 41 0 0 1 32 -26Z" fill="#fff" opacity="0.2" />
          <path d="M0 0L-12 39A41 41 0 0 1 -32 26Z" fill="#fff" opacity="0.2" />
          <circle cx="8" r="1.8" fill="#ffe2c4" />
        </g>
      </g>

      {/* Camera flash */}
      <circle
        cx="590"
        cy="202"
        r="30"
        fill="url(#scene-glow)"
        opacity="0"
        className={`animate-flash origin-center ${anim}`}
      />

      {/* Photo print, above the vinyl, lighting up with each flash */}
      <Sprite name="polaroid" />
      <polygon
        points="611,232 677,241 669,289 597,279"
        fill="#fffaf0"
        opacity="0"
        className={`animate-flash ${anim}`}
      />

      {/* Spark running along the ring */}
      <g className="motion-reduce:hidden">
        {[
          { r: 10, fill: "#ffe9b0", opacity: 0.4 },
          { r: 3.5, fill: "#fffaf0", opacity: 1 },
        ].map(({ r, fill, opacity }) => (
          <circle key={r} r={r} fill={fill} opacity={opacity}>
            <animateMotion
              dur="7s"
              repeatCount="indefinite"
              path={RING_ARC}
              keyPoints="0;1;0"
              keyTimes="0;0.5;1"
              calcMode="linear"
            />
          </circle>
        ))}
      </g>

      <g className={`animate-float-soft ${anim}`}>
        <Sprite name="ai" />
      </g>
      <g className={`animate-float-soft ${anim}`} style={delay(1.5)}>
        <Sprite name="code" />
      </g>
      <g className={`animate-drive ${anim}`}>
        <Sprite name="car" />
      </g>
      <g className={`animate-fly ${anim}`}>
        <Sprite name="plane" />
      </g>
    </svg>
  );
}
