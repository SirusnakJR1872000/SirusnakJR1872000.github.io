"use client";

import { type PointerEvent, useId, useRef, useState } from "react";
import {
  ArrowRight,
  Layers,
  Maximize2,
  Search,
  Shield,
  Sparkle,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  LayoutGroup,
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { CountUp } from "@/components/CountUp";
import { WaveCanvas } from "@/components/WaveCanvas";
import { type Project, site } from "@/content/site";

const { projectsIntro: intro, projects } = site;

const statIcons: Record<Project["stats"][number]["icon"], LucideIcon> = {
  target: Target,
  zap: Zap,
  shield: Shield,
  layers: Layers,
  search: Search,
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

// One spring for every card morph so they move together.
const morph = { type: "spring", stiffness: 170, damping: 26 } as const;

/* ---------- Illustrations ---------- */

function BarsArt() {
  const gradient = useId();
  const heights = [26, 40, 54, 72];
  return (
    <svg
      viewBox="0 0 80 80"
      className="h-[62%] w-[62%] overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7d9c3f" />
          <stop offset="1" stopColor="#3f5719" />
        </linearGradient>
      </defs>
      {heights.map((h, i) => (
        <motion.rect
          key={h}
          x={4 + i * 19}
          y={78 - h}
          width={13}
          height={h}
          rx={3}
          fill={`url(#${gradient})`}
          style={{ originY: 1, transformBox: "fill-box" }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 12,
            delay: 0.3 + i * 0.12,
          }}
        />
      ))}
    </svg>
  );
}

function ChatArt() {
  const back = useId();
  const front = useId();
  return (
    <svg
      viewBox="0 0 80 72"
      className="h-[60%] w-[62%] overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id={back} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#7e9a48" />
          <stop offset="1" stopColor="#4e6824" />
        </linearGradient>
        <linearGradient id={front} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#6f8c37" />
          <stop offset="1" stopColor="#3d5419" />
        </linearGradient>
      </defs>
      <g className="transition-transform duration-300 group-hover:-translate-y-1">
        <path
          d="M28 4h44a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6h-4v9l-10-9H28a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6Z"
          fill={`url(#${back})`}
        />
        {[38, 50, 62].map((cx, i) => (
          <motion.circle
            key={cx}
            cx={cx}
            cy={21}
            r={3}
            fill="#eef0dc"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </g>
      <g className="transition-transform duration-300 group-hover:translate-y-1">
        <path
          d="M8 26h40a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H22l-10 9v-9H8a6 6 0 0 1-6-6V32a6 6 0 0 1 6-6Z"
          fill={`url(#${front})`}
          stroke="#f2ecdb"
          strokeWidth={1.5}
        />
        <rect x={10} y={36} width={30} height={4} rx={2} fill="#eef0dc" />
        <rect
          x={10}
          y={45}
          width={20}
          height={4}
          rx={2}
          fill="#eef0dc"
          opacity={0.8}
        />
      </g>
    </svg>
  );
}

function FlagArt() {
  const checks = useId();
  return (
    <svg
      viewBox="0 0 80 80"
      className="h-[64%] w-[64%] overflow-visible"
      aria-hidden
    >
      <defs>
        <pattern
          id={checks}
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <rect width="12" height="12" fill="#eef0dc" />
          <rect width="6" height="6" fill="#4b6820" />
          <rect x="6" y="6" width="6" height="6" fill="#4b6820" />
        </pattern>
      </defs>
      <line
        x1="10"
        y1="74"
        x2="26"
        y2="10"
        stroke="#4b6820"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <g className="origin-[26px_12px] animate-flag [transform-box:view-box] motion-reduce:animate-none">
        <path
          d="M25 12c10-6 20 6 30 0s16-4 22-2l-8 32c-6-2-12-4-22 2s-20-6-30 0Z"
          fill={`url(#${checks})`}
          stroke="#4b6820"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** Small clinical document, used when the clinical project is in the list. */
function DocArt() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="h-[64%] w-[64%] overflow-visible"
      aria-hidden
    >
      <rect
        x="20"
        y="6"
        width="44"
        height="58"
        rx="7"
        fill="#d9d3bb"
        transform="rotate(-8 42 35)"
      />
      <rect
        x="16"
        y="12"
        width="46"
        height="60"
        rx="7"
        fill="#fbf8ef"
        stroke="#cfc8ad"
      />
      <path d="M26 20h5v5h5v5h-5v5h-5v-5h-5v-5h5z" fill="#5a7a2a" />
      {[44, 51, 58].map((y, i) => (
        <motion.rect
          key={y}
          x="22"
          y={y}
          width={i === 2 ? 22 : 32}
          height="3.5"
          rx="1.75"
          fill="#b9b79a"
          style={{ originX: 0, transformBox: "fill-box" }}
          animate={{ scaleX: [0, 1, 1, 0] }}
          transition={{
            duration: 4.5,
            times: [0, 0.25, 0.85, 1],
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </svg>
  );
}

const smallArts = { doc: DocArt, bars: BarsArt, chat: ChatArt, flag: FlagArt };

/** Stacked clinical documents with an "AI" badge; lines keep writing themselves. */
function DocumentStack() {
  return (
    <>
      <div className="absolute top-0 right-[8%] h-[62%] w-[62%] rotate-[-14deg] rounded-[22px] border border-white/30 bg-white/12 backdrop-blur-sm transition-transform duration-500 group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:rotate-[-18deg]" />
      <div className="absolute top-[12%] right-[22%] h-[56%] w-[55%] rotate-[-8deg] rounded-[20px] bg-linear-to-br from-[#efe9d6] to-[#d9d3bb] shadow-xl transition-transform duration-500 group-hover:-translate-x-2 group-hover:rotate-[-11deg]" />
      <div className="absolute top-[22%] right-[6%] h-[62%] w-[66%] [transform:rotateY(-14deg)_rotateX(4deg)_rotateZ(-3deg)] rounded-[22px] bg-linear-to-br from-[#fbf8ef] to-[#e8e3cf] p-[9%] shadow-[0_24px_50px_rgb(20_30_5/0.45)] transition-transform duration-500 group-hover:[transform:rotateY(-6deg)_rotateX(2deg)_rotateZ(-1deg)]">
        <svg
          viewBox="0 0 24 24"
          className="w-[26%] drop-shadow-[0_3px_3px_rgb(40_60_10/0.35)]"
        >
          <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" fill="#5a7a2a" />
        </svg>
        <div className="mt-[14%] grid gap-[9px]">
          {[100, 92, 96, 70].map((width, i) => (
            <motion.span
              key={i}
              className="block h-[7px] origin-left rounded-full bg-[#c9c7ad]"
              style={{ width: `${width}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1, 1, 0] }}
              transition={{
                duration: 5,
                times: [0, 0.25, 0.85, 1],
                repeat: Infinity,
                delay: 0.5 + i * 0.35,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      </div>
      <motion.div
        className="absolute right-0 bottom-[6%] grid aspect-square w-[32%] place-items-center rounded-[18px] bg-linear-to-br from-[#6c8e34] to-[#3c5418] font-sans text-[clamp(1.4rem,2.6vw,2.4rem)] font-bold text-[#f7f2e2] shadow-[0_14px_30px_rgb(20_30_5/0.5),inset_0_2px_0_rgb(255_255_255/0.25)]"
        animate={{ y: [0, -7, 0], rotate: [0, -3, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      >
        AI
      </motion.div>
    </>
  );
}

/** The big card's illustration: the document stack, or a project's art on a floating tile. */
function BigArt({ art }: { art: Project["art"] }) {
  const Art = smallArts[art];
  return (
    <motion.div
      className="relative h-full w-full [perspective:900px]"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      {art === "doc" ? (
        <DocumentStack />
      ) : (
        <>
          <div className="absolute top-[2%] right-[4%] h-[70%] w-[70%] rotate-[-12deg] rounded-[28px] border border-white/30 bg-white/12 backdrop-blur-sm transition-transform duration-500 group-hover:translate-x-3 group-hover:-translate-y-3 group-hover:rotate-[-16deg]" />
          <div className="absolute top-[16%] right-[12%] grid h-[72%] w-[72%] [transform:rotateY(-14deg)_rotateX(5deg)] place-items-center rounded-[28px] bg-linear-to-br from-[#fbf8ef] to-[#e3ddc6] shadow-[0_24px_50px_rgb(20_30_5/0.45),inset_0_2px_0_#fff] transition-transform duration-500 group-hover:[transform:rotateY(-6deg)_rotateX(2deg)]">
            <Art />
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ---------- Cards ---------- */

function FeaturedCard({ project }: { project: Project }) {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(tiltY, (v) => v * -5),
    { stiffness: 120, damping: 18 },
  );
  const rotateY = useSpring(
    useTransform(tiltX, (v) => v * 5),
    { stiffness: 120, damping: 18 },
  );

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    tiltX.set((event.clientX - box.left) / box.width - 0.5);
    tiltY.set((event.clientY - box.top) / box.height - 0.5);
  };
  const reset = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.article
      layoutId={`project-${project.id}`}
      transition={{ layout: morph }}
      style={{ rotateX, rotateY, borderRadius: 24 }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className="group relative overflow-hidden bg-linear-140 from-[#5f7040] via-[#4e602f] to-[#3e4f22] p-7 text-[#f7f1e3] shadow-[0_30px_60px_rgb(40_55_15/0.35)] sm:p-11"
    >
      {/* Soft light sweep */}
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sheen bg-linear-to-r from-transparent via-white/10 to-transparent motion-reduce:hidden"
        aria-hidden
      />
      {/* Decorative contour lines */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 w-full opacity-25"
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        aria-hidden
      >
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M0 ${150 + i * 4} C150 ${60 + i * 9} 330 ${210 - i * 4} 600 ${90 + i * 8}`}
            fill="none"
            stroke="#e8e5c8"
            strokeWidth={0.8}
          />
        ))}
      </svg>

      {/* Content fades in once the card has finished growing. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.25 }}
      >
        <div className="pointer-events-none absolute top-[11%] right-[5%] hidden h-[56%] w-[34%] sm:block">
          <BigArt art={project.art} />
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f3ecd8] px-4 py-2 text-[0.95rem] font-medium text-[#33421b]">
            <Sparkle className="size-4" aria-hidden />
            {projects.badge}
          </span>

          <h3 className="mt-7 font-serif text-[clamp(1.9rem,2.6vw,2.5rem)] leading-[1.15] font-medium sm:max-w-[64%]">
            {(project.titleLines ?? [project.title]).map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h3>
          <p className="mt-4 text-[clamp(1rem,1.2vw,1.17rem)] leading-[1.5] text-[#f7f1e3]/85 sm:max-w-[58%]">
            {project.description}
          </p>

          {project.stats.length > 0 && (
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-0">
              {project.stats.map(({ value, label, note, icon }, i) => {
                const Icon = statIcons[icon];
                return (
                  <li
                    key={label}
                    className={`sm:max-w-[13rem] sm:min-w-[9rem] sm:pr-6 ${
                      i > 0 ? "sm:border-l sm:border-[#f7f1e3]/25 sm:pl-6" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2.5 font-serif text-[1.75rem] leading-none font-semibold">
                      <Icon
                        className="size-6.5"
                        strokeWidth={1.6}
                        aria-hidden
                      />
                      <CountUp value={value} />
                    </span>
                    <span className="mt-2 block text-[0.95rem] leading-snug text-[#f7f1e3]/80">
                      {label}
                      {note && <span className="block">{note}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-9 flex flex-wrap items-center justify-between gap-5 border-t border-[#f7f1e3]/20 pt-7">
            <ul className="flex flex-wrap gap-2.5">
              {project.tags.map((tag, i) => (
                <motion.li
                  key={tag}
                  className="rounded-full border border-[#f7f1e3]/45 px-3.5 py-1 text-[0.92rem]"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                    delay: 0.4 + i * 0.07,
                  }}
                >
                  {tag}
                </motion.li>
              ))}
            </ul>
            <a
              href={project.href}
              className="group/cta inline-flex h-[50px] items-center gap-3 rounded-full bg-[#f7f1e3] px-7 text-[1.05rem] font-semibold text-[#2d3a17] shadow-[0_10px_24px_rgb(20_30_5/0.3)] transition hover:-translate-y-0.5 hover:bg-white"
            >
              View Case Study
              <ArrowRight
                className="size-5 transition-transform group-hover/cta:translate-x-1"
                aria-hidden
              />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const Art = smallArts[project.art];
  return (
    <motion.article
      layoutId={`project-${project.id}`}
      transition={{ layout: morph }}
      style={{ borderRadius: 22 }}
      whileHover={{ y: -5 }}
      className="group relative border border-line bg-[#fffaf4] p-6 shadow-[0_10px_30px_rgb(60_50_20/0.06)] transition-[box-shadow,border-color] hover:border-accent/40 hover:shadow-[0_22px_44px_rgb(74_94_35/0.14)] sm:p-7"
    >
      <motion.div
        className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="grid size-24 flex-none place-items-center rounded-[20px] bg-linear-to-br from-[#f3eedf] to-[#e8e1cc] shadow-[inset_0_2px_0_#fff,0_6px_16px_rgb(60_50_20/0.08)] sm:mr-4 sm:size-[96px]">
          <Art />
        </div>

        <div className="min-w-0 flex-1 max-sm:pr-12">
          <h3 className="font-serif text-[clamp(1.3rem,1.62vw,1.6rem)] leading-tight font-semibold">
            {/* The button's overlay covers the whole card, so the card is clickable anywhere. */}
            <button
              type="button"
              onClick={onOpen}
              aria-controls="featured-project"
              className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none"
            >
              {project.title}
            </button>
          </h3>
          <p className="mt-2 max-w-[34em] text-[1rem] leading-[1.45] text-ink-soft">
            {project.description}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-line bg-[#f3eee2] px-3.5 py-1 text-[0.88rem]"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <span
          className="absolute top-6 right-6 grid size-11 place-items-center rounded-full border border-accent/60 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-canvas group-has-[button:focus-visible]:ring-2 group-has-[button:focus-visible]:ring-accent sm:static"
          aria-hidden
        >
          <Maximize2 className="size-4.5 transition-transform duration-300 group-hover:scale-110" />
        </span>
      </motion.div>
    </motion.article>
  );
}

export function ProjectsSection() {
  const [activeId, setActiveId] = useState(projects.items[0].id);
  const featuredRef = useRef<HTMLDivElement>(null);
  const active =
    projects.items.find((p) => p.id === activeId) ?? projects.items[0];
  const rest = projects.items.filter((p) => p.id !== active.id);

  const open = (id: string) => {
    setActiveId(id);
    // When the cards are stacked, the big card is above the list; bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      featuredRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <section id="projects" className="relative overflow-hidden pt-20 pb-28">
        <WaveCanvas className="top-0 right-0 hidden h-[260px] w-[30%] opacity-60 lg:block" />
        <WaveCanvas
          flip
          className="bottom-0 left-0 hidden h-[200px] w-[45%] opacity-50 lg:block"
        />

        <div className="relative mx-auto w-full max-w-[1720px] px-[clamp(16px,3.2vw,49px)]">
          <div className="lg:pl-5">
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-5 font-serif text-xl font-semibold tracking-[0.2em] text-accent uppercase"
            >
              <motion.span
                className="h-px w-12 origin-left bg-accent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                aria-hidden
              />
              {intro.eyebrow}
            </motion.p>

            <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-11">
              <motion.h2
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-serif text-[clamp(2.3rem,4vw,3.9rem)] leading-[1.1] font-medium tracking-[-0.015em] lg:whitespace-nowrap"
              >
                {intro.heading.lead}{" "}
                <em className="text-accent">{intro.heading.emphasis}</em>
              </motion.h2>
              <motion.span
                className="hidden h-[72px] w-px origin-top bg-line lg:block"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                aria-hidden
              />
              <motion.p
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="max-w-[27em] text-[clamp(1rem,1.2vw,1.17rem)] leading-[1.55] text-ink-soft"
              >
                {intro.summary}
              </motion.p>
            </div>
          </div>

          <LayoutGroup>
            <div className="mt-14 grid gap-7 lg:grid-cols-[minmax(0,758fr)_minmax(0,662fr)] lg:gap-[30px]">
              {/* Entrance animations live on these wrappers so they don't fight the card morphs. */}
              <motion.div
                ref={featuredRef}
                id="featured-project"
                aria-live="polite"
                className="scroll-mt-28 self-start [perspective:1400px]"
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <FeaturedCard key={active.id} project={active} />
              </motion.div>

              <motion.div
                className="grid content-start gap-6"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              >
                {rest.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={() => open(project.id)}
                  />
                ))}
              </motion.div>
            </div>
          </LayoutGroup>
        </div>
      </section>
    </MotionConfig>
  );
}
