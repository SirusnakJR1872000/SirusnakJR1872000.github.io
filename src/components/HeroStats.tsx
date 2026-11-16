"use client";

import { type MouseEvent, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Hourglass, Layers, type LucideIcon } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { BarsIcon } from "@/components/icons";
import { site } from "@/content/site";

type Stat = {
  value: string;
  label: string;
  Icon: LucideIcon | typeof BarsIcon;
  numeric?: boolean;
  href?: string;
};

const stats: Stat[] = [
  {
    ...site.stats.years,
    Icon: Hourglass,
    numeric: true,
    href: site.links.journey,
  },
  { ...site.stats.systems, Icon: Layers, numeric: true },
  { ...site.stats.expertise, Icon: Box },
  { ...site.stats.impact, Icon: BarsIcon },
];

const round = (n: number) => n.toFixed(1);

/** Builds a bundle of fine lines, with `t` running from -1 to 1 across it. */
function bundle(count: number, line: (t: number) => string) {
  return Array.from({ length: count }, (_, i) =>
    line((2 * i) / (count - 1) - 1),
  );
}

// Viewbox 200×60: a ribbon that twists through the node at its centre.
const CONNECTOR = bundle(
  13,
  (t) =>
    `M0 ${round(42 + 9 * t)} C60 ${round(40 + 8 * t)} 78 ${round(32 + 2 * t)} 100 30 S150 ${round(24 - 6 * t)} 200 ${round(16 - 9 * t)}`,
);

// Viewbox 200×50: threads that dip below a card.
const SWOOP = bundle(
  7,
  (t) =>
    `M0 ${round(4 + 2 * t)} C40 ${round(42 + 6 * t)} 130 ${round(46 + 3 * t)} 200 ${round(8 + 4 * t)}`,
);

// Viewbox 200×60: threads coming in from the edge of the page.
const LEAD_IN = bundle(
  9,
  (t) =>
    `M0 ${round(46 + 8 * t)} C70 ${round(42 + 7 * t)} 120 ${round(8 + 4 * t)} 200 ${round(22 + 14 * t)}`,
);

function Threads({
  paths,
  viewBox,
  className,
}: {
  paths: string[];
  viewBox: string;
  className: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="none"
      fill="none"
      className={`pointer-events-none absolute overflow-visible ${className}`}
      aria-hidden
    >
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          stroke="#7d9a45"
          strokeWidth={0.75}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/** The ribbon and glowing node joining two cards in the row. */
function Connector() {
  return (
    <li
      className="relative -z-10 hidden min-w-6 flex-1 self-center wide:block"
      aria-hidden
    >
      <div className="relative h-[clamp(40px,4vw,66px)]">
        <Threads
          paths={CONNECTOR}
          viewBox="0 0 200 60"
          className="top-0 left-[-60%] h-full w-[220%] animate-ribbon opacity-60 motion-reduce:animate-none"
        />
        <span className="absolute top-1/2 left-1/2 size-3 -translate-1/2">
          <span className="absolute -inset-1.5 animate-glow rounded-full bg-[#d7ec6e]/70 blur-[6px] motion-reduce:animate-none" />
          <span className="absolute inset-0 rounded-full bg-radial from-[#fdffd9] to-[#d6e86a] shadow-[0_0_8px_rgb(205_230_90/0.9)]" />
        </span>
      </div>
    </li>
  );
}

// A soft spring with almost no bounce; it keeps its momentum if interrupted.
const LIFT = {
  type: "spring",
  stiffness: 300,
  damping: 26,
  mass: 0.9,
} as const;

function ExpandingCard({
  from,
  onDone,
}: {
  from: DOMRect;
  onDone: () => void;
}) {
  return createPortal(
    <motion.div
      className="fixed z-[100] bg-linear-to-r from-[#4f6b22] via-[#3a4f19] to-[#3a4f19]"
      initial={{
        top: from.top,
        left: from.left,
        width: from.width,
        height: from.height,
        borderRadius: 40,
      }}
      animate={{
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
      }}
      transition={{ duration: 0.75, ease: [0.32, 0.72, 0, 1] }}
      onAnimationComplete={onDone}
      aria-hidden
    />,
    document.body,
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const { value, label, Icon, numeric, href } = stat;
  const [hovered, setHovered] = useState(false);
  const [expanding, setExpanding] = useState<DOMRect | null>(null);
  const router = useRouter();

  // The card grows to fill the window, then the next page takes over from it.
  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    setExpanding(event.currentTarget.getBoundingClientRect());
  };

  const card = (
    <motion.div
      animate={{ y: hovered ? -8 : 0, scale: hovered ? 1.035 : 1 }}
      transition={LIFT}
      className="relative isolate flex h-full items-center gap-[clamp(12px,1vw,18px)] overflow-hidden rounded-[clamp(28px,2.6vw,44px)] border border-white/80 bg-linear-to-b from-[#fffdf8] to-[#f8f2e6] py-[clamp(16px,1.5vw,26px)] pr-[clamp(20px,1.8vw,32px)] pl-[clamp(16px,1.4vw,26px)] shadow-[0_16px_34px_rgb(60_50_20/0.09),0_2px_6px_rgb(60_50_20/0.04),inset_0_1px_0_#fff] transition-[box-shadow,border-color] duration-500 ease-apple group-hover:border-transparent group-hover:shadow-[0_26px_54px_rgb(92_125_40/0.32),0_6px_14px_rgb(60_50_20/0.08)] motion-reduce:transition-none"
    >
      {/* Gradients can't animate, so the green is a layer that fades in. */}
      <span
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-[#4f6b22] via-[#3a4f19] to-[#2a3a12] opacity-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.2),inset_0_-1.5px_0_rgb(190_225_100/0.6)] transition-opacity duration-500 ease-apple group-hover:opacity-100"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-y-0 left-0 -z-10 hidden w-1/2 animate-sheen bg-linear-to-r from-transparent via-white/15 to-transparent group-hover:block motion-reduce:group-hover:hidden"
        aria-hidden
      />
      <span className="relative grid size-[clamp(52px,3.9vw,70px)] flex-none place-items-center overflow-hidden rounded-[clamp(15px,1.3vw,22px)] bg-[#f4f0dd] text-accent shadow-[0_6px_14px_rgb(60_50_20/0.09),inset_0_1px_0_#fff] transition-[color,scale] duration-500 ease-apple group-hover:scale-106 group-hover:text-[#fbf8ec] motion-reduce:transition-none">
        <span
          className="absolute inset-0 bg-linear-to-br from-[#7d9d3f] to-[#47621f] opacity-0 shadow-[inset_0_1px_0_rgb(255_255_255/0.3)] transition-opacity duration-500 ease-apple group-hover:opacity-100"
          aria-hidden
        />
        <Icon
          className="relative size-[clamp(26px,2vw,36px)]"
          strokeWidth={1.5}
          aria-hidden
        />
      </span>
      <div>
        <strong
          className={`block font-serif leading-[1.12] font-semibold whitespace-nowrap transition-colors duration-500 ease-apple group-hover:text-[#fbf8ec] ${
            numeric
              ? "text-[2rem] wide:text-[clamp(1.9rem,2.6vw,2.8rem)]"
              : "text-[1.45rem] wide:text-[clamp(1.3rem,1.55vw,1.75rem)]"
          }`}
        >
          {value}
        </strong>
        <span className="mt-0.5 block text-[1rem] whitespace-nowrap text-ink-soft transition-colors duration-500 ease-apple group-hover:text-[#e4e8cf] wide:text-[clamp(0.9rem,1vw,1.125rem)]">
          {label}
        </span>
      </div>
    </motion.div>
  );

  return (
    <motion.li
      className="group relative wide:flex-none"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {index === 0 && (
        <Threads
          paths={LEAD_IN}
          viewBox="0 0 200 60"
          className="top-[-6%] right-[88%] hidden h-[80%] w-[20vw] opacity-45 [mask-image:linear-gradient(90deg,transparent,#000_50%)] wide:block"
        />
      )}
      <Threads
        paths={SWOOP}
        viewBox="0 0 200 50"
        className="top-[58%] left-[12%] hidden h-[74%] w-[92%] opacity-40 wide:block"
      />
      {/* The glow under the card while it's hovered */}
      <span
        className="pointer-events-none absolute inset-x-[8%] -bottom-3 h-10 rounded-full bg-[#b5d957]/55 opacity-0 blur-xl transition-opacity duration-500 ease-apple group-hover:opacity-100"
        aria-hidden
      />

      {href ? (
        <Link
          href={href}
          onClick={open}
          onPointerEnter={() => void import("@/components/journey3d/Stage")}
          className="block h-full rounded-[40px]"
        >
          {card}
        </Link>
      ) : (
        card
      )}
      {href && expanding && (
        <ExpandingCard from={expanding} onDone={() => router.push(href)} />
      )}
    </motion.li>
  );
}

export function HeroStats() {
  return (
    <MotionConfig reducedMotion="user">
      <ul className="relative isolate grid gap-4 pt-14 pb-24 sm:grid-cols-2 lg:pl-6 wide:-mr-[min(2.5vw,42px)] wide:flex wide:items-stretch">
        {stats.map((stat, index) => (
          <StatRow key={stat.label} stat={stat} index={index} />
        ))}
      </ul>
    </MotionConfig>
  );
}

function StatRow({ stat, index }: { stat: Stat; index: number }) {
  return (
    <>
      {index > 0 && <Connector />}
      <StatCard stat={stat} index={index} />
    </>
  );
}
