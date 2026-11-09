"use client";

import { type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bot,
  CalendarDays,
  Check,
  Clock,
  CodeXml,
  Database,
  GraduationCap,
  Infinity as InfinityIcon,
  Layers,
  Leaf,
  Link2,
  type LucideIcon,
  MapPin,
  Network,
  ScanEye,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { CountUp } from "@/components/CountUp";
import { WaveCanvas } from "@/components/WaveCanvas";
import { type Experience, site } from "@/content/site";

const roleIcons: Record<Experience["icon"], LucideIcon> = {
  layers: Layers,
  leaf: Leaf,
  graduation: GraduationCap,
  sparkles: Sparkles,
  scan: ScanEye,
  bot: Bot,
};

const metricIcons: Record<Experience["metrics"][number]["icon"], LucideIcon> = {
  trend: TrendingUp,
  layers: Layers,
  zap: Zap,
  target: Target,
  clock: Clock,
  users: Users,
};

// Tools without a matching icon show their name only.
const stackIcons: Record<string, LucideIcon> = {
  Python: CodeXml,
  PySpark: Sparkles,
  LangChain: Link2,
  FAISS: InfinityIcon,
  AWS: Database,
  NetworkX: Network,
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

/** Turns **double-asterisk** spans into bold text. */
function rich(text: string): ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h4 className="mt-7 flex items-center gap-4 font-serif text-[1.3rem] font-semibold text-accent">
      {children}
      <span className="h-px flex-1 bg-line" aria-hidden />
    </h4>
  );
}

// Static class names so Tailwind can see them.
const metricColumns = [
  "",
  "sm:grid-cols-1 sm:max-w-sm",
  "sm:grid-cols-2",
  "sm:grid-cols-3",
];

/** Key Work points; several groups get animated tabs to switch between them. */
function KeyWork({ groups }: { groups: Experience["work"] }) {
  const [current, setCurrent] = useState(0);
  const group = groups[current];
  const tabbed = groups.length > 1;

  return (
    <>
      {tabbed && (
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Projects"
        >
          {groups.map((g, i) => (
            <button
              key={g.label ?? i}
              type="button"
              aria-pressed={i === current}
              onClick={() => setCurrent(i)}
              className={`relative cursor-pointer rounded-full border px-4 py-1.5 text-[0.92rem] font-medium transition-colors ${
                i === current
                  ? "border-transparent text-canvas"
                  : "border-line text-ink-soft hover:border-accent/50 hover:text-accent"
              }`}
            >
              {i === current && (
                <motion.span
                  layoutId="work-group"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  aria-hidden
                />
              )}
              <span className="relative">{g.label}</span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tabbed && group.title && (
            <p className="mt-4 font-serif text-[1.08rem] text-ink-muted italic">
              {group.title}
            </p>
          )}
          <ul className="mt-3 grid gap-2.5">
            {group.items.map((item, i) => (
              <motion.li
                key={item}
                className="flex items-start gap-3.5 text-[1.02rem] leading-snug text-ink-soft"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.09 }}
              >
                <span className="mt-0.5 grid size-5 flex-none place-items-center rounded-full bg-accent-tint">
                  <Check
                    className="size-3.5 text-accent"
                    strokeWidth={3}
                    aria-hidden
                  />
                </span>
                <span>{rich(item)}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function RoleDetails({ job }: { job: Experience }) {
  const Icon = roleIcons[job.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex flex-wrap items-start gap-5 border-b border-line pb-5 sm:flex-nowrap">
        <motion.span
          className="grid size-16 flex-none place-items-center rounded-2xl border border-line bg-canvas shadow-[0_6px_16px_rgb(60_50_20/0.07)] sm:size-20"
          initial={{ rotate: -12, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        >
          <Icon
            className="size-8 text-accent sm:size-10"
            strokeWidth={1.3}
            aria-hidden
          />
        </motion.span>
        <div className="min-w-[12rem] flex-1">
          <h3 className="font-serif text-[clamp(1.6rem,2.2vw,2rem)] leading-tight font-semibold">
            {job.company}
          </h3>
          <p className="mt-1 text-[1.1rem]">{job.role}</p>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4.5" aria-hidden />
              {job.period}
            </span>
            {job.location && (
              <>
                <span
                  className="h-4 w-px bg-ink-muted/50 max-sm:hidden"
                  aria-hidden
                />
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4.5" aria-hidden />
                  {job.location}
                </span>
              </>
            )}
          </p>
        </div>
        {job.current && (
          // On phones the badge takes its own line above the title.
          <span className="max-sm:order-first max-sm:basis-full">
            <span className="inline-block rounded-full bg-accent-tint px-5 py-1.5 font-medium text-accent-strong">
              Current Role
            </span>
          </span>
        )}
      </div>

      {job.summary && (
        <p className="mt-5 text-[clamp(1.05rem,1.3vw,1.25rem)] leading-[1.5]">
          {job.summary}
        </p>
      )}

      {job.metrics.length > 0 && (
        <ul
          className={`mt-6 grid gap-4 ${metricColumns[Math.min(job.metrics.length, 3)]}`}
        >
          {job.metrics.map((metric, i) => {
            const MetricIcon = metricIcons[metric.icon];
            const Trend = metric.trend === "up" ? ArrowUp : ArrowDown;
            return (
              <motion.li
                key={metric.label}
                className="rounded-2xl bg-[#f2f0e3] px-6 py-4 transition-shadow hover:shadow-[0_12px_28px_rgb(74_94_35/0.14)]"
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -4 }}
                transition={{
                  type: "spring",
                  stiffness: 170,
                  damping: 18,
                  delay: 0.15 + i * 0.1,
                }}
              >
                <div className="flex items-center gap-4">
                  <MetricIcon
                    className="size-9 text-accent"
                    strokeWidth={1.4}
                    aria-hidden
                  />
                  <span className="font-serif text-[2.4rem] leading-none font-semibold text-accent">
                    <CountUp value={metric.value} />
                  </span>
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-[0.95rem] leading-snug">
                  <Trend
                    className="mt-0.5 size-4 flex-none"
                    aria-label={metric.trend === "up" ? "Increased" : "Reduced"}
                  />
                  <span>
                    {metric.label}
                    <span className="block text-ink-soft">({metric.note})</span>
                  </span>
                </p>
              </motion.li>
            );
          })}
        </ul>
      )}

      {job.work.some((group) => group.items.length > 0) && (
        <>
          <SubHeading>Key Work</SubHeading>
          <KeyWork groups={job.work} />
        </>
      )}

      {job.stack.length > 0 && (
        <>
          <SubHeading>Tech Stack</SubHeading>
          <ul className="mt-4 flex flex-wrap gap-3">
            {job.stack.map((tool, i) => {
              const ToolIcon = stackIcons[tool];
              return (
                <motion.li
                  key={tool}
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-canvas px-4 py-2.5 text-[0.98rem] shadow-[0_3px_8px_rgb(60_50_20/0.05)] transition-colors hover:border-accent/50"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 16,
                    delay: 0.5 + i * 0.05,
                  }}
                >
                  {ToolIcon && (
                    <ToolIcon
                      className="size-5 text-accent"
                      strokeWidth={1.6}
                      aria-hidden
                    />
                  )}
                  {tool}
                </motion.li>
              );
            })}
          </ul>
        </>
      )}
    </motion.div>
  );
}

export function ExperienceSection() {
  const { experienceIntro: intro, experience } = site;
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const select = (index: number, { scroll = false } = {}) => {
    setActive(index);
    // When the list and card are stacked, bring the card into view.
    if (scroll && window.matchMedia("(max-width: 1279px)").matches) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[
      event.key
    ];
    if (!step) return;
    event.preventDefault();
    const next = (active + step + experience.length) % experience.length;
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <section id="experience" className="relative overflow-hidden pt-20 pb-24">
        <WaveCanvas className="top-0 right-0 hidden h-[340px] w-[52%] opacity-70 lg:block" />

        <div className="relative mx-auto w-full max-w-[1720px] px-[clamp(16px,4vw,62px)]">
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-5 font-serif text-xl font-semibold tracking-[0.18em] text-accent uppercase"
          >
            <motion.span
              className="h-px w-14 origin-left bg-accent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              aria-hidden
            />
            {intro.eyebrow}
          </motion.p>

          <h2 className="mt-5 font-serif text-[clamp(2.3rem,3.9vw,3.75rem)] leading-[1.1] font-normal tracking-[-0.01em]">
            <motion.span
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="block"
            >
              {intro.heading.lead}
            </motion.span>
            <motion.em
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="block font-medium text-accent"
            >
              {intro.heading.emphasis}
            </motion.em>
          </h2>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-3 max-w-[34em] text-[clamp(1.05rem,1.3vw,1.3rem)] leading-[1.45] text-ink-soft"
          >
            {intro.summary}
          </motion.p>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,484fr)_minmax(0,906fr)] xl:gap-7">
            {/* Timeline of roles; each one is a tab for the card on the right. */}
            <div className="relative xl:pt-9">
              <motion.span
                className="absolute top-14 bottom-12 left-5 w-px origin-top bg-accent/45 xl:top-[90px]"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                aria-hidden
              />
              <div
                role="tablist"
                aria-label="Roles"
                aria-orientation="vertical"
                onKeyDown={onKeyDown}
                className="grid gap-3 xl:gap-6"
              >
                {experience.map((job, index) => {
                  const Icon = roleIcons[job.icon];
                  const selected = index === active;
                  return (
                    <motion.div
                      key={`${job.company}-${job.role}`}
                      className="relative pl-10 sm:pl-12"
                      initial={{ opacity: 0, x: -24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.12 }}
                    >
                      {/* Timeline node */}
                      <span
                        className="absolute top-1/2 left-5 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center"
                        aria-hidden
                      >
                        {selected && (
                          <span className="absolute inset-[-5px] animate-ping rounded-full bg-accent/25 motion-reduce:animate-none" />
                        )}
                        <span
                          className={`relative rounded-full border-2 border-accent transition-all duration-300 ${
                            selected
                              ? "size-4 bg-accent ring-4 ring-accent-tint"
                              : "size-3 bg-canvas"
                          }`}
                        />
                      </span>

                      <button
                        ref={(el) => {
                          tabRefs.current[index] = el;
                        }}
                        type="button"
                        role="tab"
                        id={`role-tab-${index}`}
                        aria-selected={selected}
                        aria-controls="role-panel"
                        tabIndex={selected ? 0 : -1}
                        onClick={() => select(index, { scroll: true })}
                        className="group relative flex w-full cursor-pointer items-center gap-4 rounded-2xl px-4 py-4 text-left sm:gap-5 sm:px-5 sm:py-5"
                      >
                        {selected && (
                          <motion.span
                            layoutId="active-role"
                            className="absolute inset-0 rounded-2xl bg-[#ecebd9] shadow-[0_10px_26px_rgb(74_94_35/0.12)]"
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 28,
                            }}
                            aria-hidden
                          />
                        )}
                        <span
                          className={`relative grid size-14 flex-none place-items-center sm:size-[68px] rounded-2xl border border-line bg-canvas shadow-[0_6px_14px_rgb(60_50_20/0.06)] transition-transform duration-300 group-hover:-rotate-3 ${
                            selected ? "scale-105" : ""
                          }`}
                        >
                          <Icon
                            className="size-8 text-accent"
                            strokeWidth={1.4}
                            aria-hidden
                          />
                        </span>
                        <span className="relative min-w-0 flex-1">
                          <span className="block font-serif text-[1.4rem] leading-tight font-semibold">
                            {job.company}
                          </span>
                          <span className="mt-0.5 block text-[1.05rem]">
                            {job.role}
                          </span>
                          <span className="mt-1 block text-ink-muted">
                            {job.period}
                          </span>
                        </span>
                        <span
                          className={`relative grid size-10 flex-none place-items-center rounded-full bg-accent max-sm:hidden text-canvas transition-all duration-300 ${
                            selected
                              ? "scale-100 opacity-100"
                              : "scale-50 opacity-0 group-hover:scale-90 group-hover:opacity-60"
                          }`}
                          aria-hidden
                        >
                          <ArrowRight className="size-5" />
                        </span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Details for the selected role */}
            <motion.div
              ref={panelRef}
              id="role-panel"
              role="tabpanel"
              aria-labelledby={`role-tab-${active}`}
              className="scroll-mt-28 self-start rounded-3xl border border-line bg-[#fffcf7]/85 p-6 shadow-[0_20px_50px_rgb(60_50_20/0.07)] backdrop-blur-sm sm:p-9"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                <RoleDetails
                  key={`${experience[active].company}-${experience[active].role}`}
                  job={experience[active]}
                />
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
