"use client";

import { type PointerEvent } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Camera,
  CodeXml,
  Flag,
  Layers,
  type LucideIcon,
  Mountain,
  Music,
  Plane,
  Rocket,
  Settings,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { CountUp } from "@/components/CountUp";
import { BarsIcon } from "@/components/icons";
import { WaveCanvas } from "@/components/WaveCanvas";
import { site } from "@/content/site";

const { about } = site;

const icons: Record<string, LucideIcon | typeof BarsIcon> = {
  layers: Layers,
  bars: BarsIcon,
  gear: Settings,
  shield: ShieldCheck,
  plane: Plane,
  music: Music,
  flag: Flag,
  camera: Camera,
  calendar: CalendarDays,
  users: Users,
  rocket: Rocket,
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

/**
 * Round portrait. The person rises just above the frame, and on hover the
 * layers drift by different amounts for depth. This uses plain 2D movement:
 * 3D perspective would make the browser enlarge an already-drawn photo,
 * which blurs it.
 */
function Portrait() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 18 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 18 });
  const discX = useTransform(smoothX, (v) => v * 6);
  const discY = useTransform(smoothY, (v) => v * 5);
  const ringX = useTransform(smoothX, (v) => v * 10);
  const ringY = useTransform(smoothY, (v) => v * 8);
  const personX = useTransform(smoothX, (v) => v * 16);
  const personY = useTransform(smoothY, (v) => v * 10);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - box.left) / box.width - 0.5);
    pointerY.set((event.clientY - box.top) / box.height - 0.5);
  };
  const reset = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div
      className="relative mx-auto aspect-square w-(--portrait)"
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {/* Back: soft cream disc */}
      <motion.div
        style={{ x: discX, y: discY }}
        className="absolute inset-0 rounded-full border-[8px] border-[#fbf9f1] bg-[radial-gradient(circle_at_50%_42%,#f7f4e7_0%,#e9e8d2_55%,#d6d9bb_100%)] shadow-[0_26px_60px_rgb(60_70_20/0.18)]"
        initial={{ scale: 0.75, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 90, damping: 15 }}
      />

      {/* Middle: two thin arcs that draw themselves in */}
      <motion.svg
        viewBox="0 0 200 200"
        style={{ x: ringX, y: ringY }}
        className="pointer-events-none absolute -inset-[5%] h-[110%] w-[110%]"
        aria-hidden
      >
        {[
          { start: 118, length: 0.25, delay: 0.3 },
          { start: 298, length: 0.25, delay: 0.5 },
        ].map(({ start, length, delay }) => (
          <motion.circle
            key={start}
            cx="100"
            cy="100"
            r="97"
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.75"
            strokeWidth="1"
            strokeLinecap="round"
            style={{ rotate: start, transformOrigin: "100px 100px" }}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: length }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: "easeInOut", delay }}
          />
        ))}
      </motion.svg>

      {/* Front: the person, drifting the most */}
      <motion.div
        style={{ x: personX, y: personY }}
        className="portrait-pop absolute inset-x-0 -top-[25%] h-[125%]"
      >
        <motion.div
          className="absolute top-[5%] left-[4%] w-[92%]"
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 70,
            damping: 15,
            delay: 0.3,
          }}
        >
          <Image
            src={about.portrait.src}
            alt={about.portrait.alt}
            width={966}
            height={1628}
            sizes="(min-width: 1024px) 440px, 80vw"
            className="h-auto w-full drop-shadow-[0_12px_18px_rgb(30_40_10/0.16)]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

type SideProps = {
  side: (typeof about)["professional"];
  Icon: LucideIcon;
  align: "left" | "right";
};

function SideCard({ side, Icon, align }: SideProps) {
  const left = align === "left";
  return (
    <motion.div
      className={`rounded-[28px] border border-[#e4ddcc] bg-linear-to-b from-[#faf7ee] to-[#f3efe2] p-7 shadow-[0_18px_40px_rgb(60_50_20/0.06),inset_0_1px_0_#fff] sm:p-9 ${
        // Leave room where the portrait overlaps the card's inner edge.
        left
          ? "lg:pr-[calc(var(--portrait)*0.14+20px)]"
          : "lg:pl-[calc(var(--portrait)*0.14+24px)]"
      }`}
      initial={{ opacity: 0, x: left ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="flex items-center gap-6">
        <motion.span
          className="grid size-[78px] flex-none place-items-center rounded-[22px] bg-linear-to-br from-[#f0eedd] to-[#e4e3c9] text-accent shadow-[0_8px_20px_rgb(74_94_35/0.12),inset_0_1px_0_#fff]"
          whileHover={{ rotate: -6, scale: 1.05 }}
        >
          <Icon className="size-9" strokeWidth={1.6} aria-hidden />
        </motion.span>
        <div>
          <p className="text-[0.95rem] font-semibold tracking-[0.18em] text-accent uppercase">
            {side.eyebrow}
          </p>
          <h3 className="mt-1 font-serif text-[clamp(1.65rem,2.3vw,2.3rem)] leading-tight font-medium">
            {side.title}
          </h3>
        </div>
      </div>
      <p className="mt-6 text-[clamp(1.02rem,1.2vw,1.15rem)] leading-[1.55] text-ink-soft">
        {side.summary}
      </p>

      <ul className="mt-8 grid gap-6">
        {side.items.map((item, i) => {
          const ItemIcon = icons[item.icon];
          return (
            <motion.li
              key={item.title}
              className="group flex items-center gap-6"
              initial={{ opacity: 0, x: left ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.35 + i * 0.1 }}
            >
              <span className="grid size-[66px] flex-none place-items-center rounded-[20px] bg-linear-to-br from-[#efeddc] to-[#e5e4cb] text-accent shadow-[0_6px_16px_rgb(60_50_20/0.10),inset_0_1px_0_#fff] transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-6">
                <ItemIcon className="size-7" strokeWidth={1.8} aria-hidden />
              </span>
              <span>
                <span className="block text-[1.08rem] font-semibold">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-[0.92rem] text-ink-soft">
                  {item.detail}
                </span>
              </span>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}

export function AboutSection() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="about"
        className="relative overflow-hidden pt-20 pb-20 [--portrait:min(78vw,340px)] lg:[--portrait:clamp(340px,29vw,470px)]"
      >
        <WaveCanvas className="top-0 right-0 hidden h-[240px] w-[34%] opacity-60 lg:block" />
        <WaveCanvas
          flip
          className="bottom-0 left-0 hidden h-[180px] w-[40%] opacity-45 lg:block"
        />

        <div className="relative mx-auto w-full max-w-[1720px] px-[clamp(16px,2.6vw,40px)]">
          <div className="lg:pl-4">
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-5 text-lg font-semibold tracking-[0.2em] text-accent uppercase"
            >
              <motion.span
                className="h-px w-12 origin-left bg-accent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                aria-hidden
              />
              {about.eyebrow}
            </motion.p>
            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-14">
              <motion.h2
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-serif text-[clamp(2.4rem,4.3vw,4.1rem)] leading-[1.1] font-medium tracking-[-0.015em] lg:whitespace-nowrap"
              >
                {about.heading.lead}{" "}
                <em className="text-accent">{about.heading.emphasis}</em>
              </motion.h2>
              <motion.span
                className="hidden h-[72px] w-0.5 origin-top bg-accent/60 lg:block"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                aria-hidden
              />
              <motion.p
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="max-w-[36em] text-[clamp(1rem,1.2vw,1.17rem)] leading-[1.55] text-ink-soft"
              >
                {about.summary}
              </motion.p>
            </div>
          </div>

          {/* Two cards with the portrait between them (stacked on small screens). */}
          <div className="relative mt-14 grid gap-6 lg:grid-cols-2 lg:gap-x-[calc(var(--portrait)*0.73)]">
            <div className="mt-[calc(var(--portrait)*0.28)] mb-10 lg:absolute lg:mt-0 lg:top-1/2 lg:left-1/2 lg:z-10 lg:mb-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
              <Portrait />
            </div>
            <SideCard side={about.professional} Icon={CodeXml} align="left" />
            <SideCard side={about.personal} Icon={Mountain} align="right" />
          </div>

          {/* At a glance */}
          <div className="mt-14 grid items-center gap-6 sm:grid-cols-2 lg:flex lg:justify-between lg:gap-0 lg:px-10">
            <motion.span
              {...fadeUp}
              transition={{ duration: 0.6 }}
              className="relative inline-flex w-fit items-center gap-3 overflow-hidden rounded-full bg-linear-to-b from-[#5b7330] to-accent-strong px-8 py-4 text-[1.25rem] font-medium text-canvas shadow-[0_10px_24px_rgb(74_94_35/0.3),inset_0_1px_0_rgb(255_255_255/0.2)] sm:col-span-2"
            >
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-sheen bg-linear-to-r from-transparent via-white/20 to-transparent motion-reduce:hidden"
                aria-hidden
              />
              <Target className="size-7" strokeWidth={1.6} aria-hidden />
              {about.glance.label}
            </motion.span>
            {about.glance.stats.map(({ value, label, icon }, i) => {
              const StatIcon = icons[icon];
              return (
                <motion.div
                  key={label}
                  className="flex items-center gap-4 lg:border-l lg:border-line lg:pl-10"
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                >
                  <StatIcon
                    className="size-9 flex-none text-accent"
                    strokeWidth={1.4}
                    aria-hidden
                  />
                  <div>
                    <strong className="block font-serif text-[1.6rem] leading-tight font-semibold text-accent">
                      {/^\d/.test(value) ? <CountUp value={value} /> : value}
                    </strong>
                    <span className="block text-ink-soft">{label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
