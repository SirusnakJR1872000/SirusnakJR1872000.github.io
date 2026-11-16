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
  Music,
  Plane,
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
import { AboutSceneLayers } from "@/components/AboutSceneLayers";
import { CountUp } from "@/components/CountUp";
import { BarsIcon } from "@/components/icons";
import { site } from "@/content/site";

const { about } = site;

const icons: Record<string, LucideIcon | typeof BarsIcon> = {
  code: CodeXml,
  layers: Layers,
  gear: Settings,
  shield: ShieldCheck,
  plane: Plane,
  music: Music,
  flag: Flag,
  camera: Camera,
  calendar: CalendarDays,
  users: Users,
  chart: BarsIcon,
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

/**
 * The centre of the section: the artwork, its animated layers, and the real
 * photo in front. The layers drift by different amounts on hover. This is plain
 * 2D movement, because 3D perspective would blur the photo.
 */
function Stage() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 110, damping: 18 });
  const smoothY = useSpring(pointerY, { stiffness: 110, damping: 18 });
  const sceneX = useTransform(smoothX, (v) => v * 8);
  const sceneY = useTransform(smoothY, (v) => v * 6);
  const personX = useTransform(smoothX, (v) => v * 18);
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
    // The bottom margin leaves room for the photo, which runs past the artwork.
    <div
      className="relative mx-auto mb-[12%] aspect-[759/508] w-full max-w-[900px]"
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      <motion.div
        style={{ x: sceneX, y: sceneY }}
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <Image
          src={about.scene}
          alt=""
          width={1518}
          height={1016}
          sizes="(min-width: 1280px) 53vw, 100vw"
          className="h-auto w-full"
        />
        <AboutSceneLayers />
      </motion.div>

      {/* The real photo, fading out below the arms */}
      <motion.div
        style={{ x: personX, y: personY }}
        className="absolute top-[4.5%] left-[28.3%] w-1/2 [mask-image:linear-gradient(#000_74%,transparent_90%)]"
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 70,
            damping: 15,
            delay: 0.25,
          }}
        >
          <Image
            src={about.portrait.src}
            alt={about.portrait.alt}
            width={966}
            height={1628}
            sizes="(min-width: 1280px) 27vw, 50vw"
            className="h-auto w-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function SideCard({
  side,
  align,
}: {
  side: (typeof about)["professional"];
  align: "left" | "right";
}) {
  const left = align === "left";
  return (
    <motion.div
      className="relative z-10 rounded-[40px] border border-white/80 bg-white/35 p-8 shadow-[0_20px_50px_rgb(60_50_20/0.07),inset_0_1px_0_#fff] backdrop-blur-sm xl:px-9"
      initial={{ opacity: 0, x: left ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <p className="text-[0.9rem] font-semibold tracking-[0.18em] uppercase">
        {side.eyebrow}
      </p>
      <h3 className="mt-2 font-serif text-[clamp(2rem,2.75vw,2.9rem)] leading-[1.04] font-medium tracking-[-0.01em]">
        {side.title}
      </h3>
      <p className="mt-4 leading-[1.4] text-ink-soft">{side.summary}</p>

      <ul className="mt-6 grid gap-4">
        {side.items.map((item, i) => {
          const ItemIcon = icons[item.icon];
          return (
            <motion.li
              key={item.title}
              className="group flex items-center gap-4"
              initial={{ opacity: 0, x: left ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.35 + i * 0.1 }}
            >
              <span className="grid size-14 flex-none place-items-center rounded-2xl bg-[#fffcf6] text-accent shadow-[0_6px_16px_rgb(60_50_20/0.10),inset_0_1px_0_#fff] transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-6">
                <ItemIcon className="size-7" strokeWidth={1.7} aria-hidden />
              </span>
              <span>
                <span className="block text-[1.05rem] font-semibold">
                  {item.title}
                </span>
                <span className="block text-[0.88rem] leading-snug text-ink-soft">
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
      <section id="about" className="relative overflow-hidden pt-20 pb-20">
        <div className="relative mx-auto w-full max-w-[1720px] px-[clamp(16px,1.7vw,28px)]">
          <div className="lg:pl-12">
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-5 font-medium tracking-[0.3em] text-ink-soft uppercase"
            >
              <motion.span
                className="h-px w-10 origin-left bg-accent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                aria-hidden
              />
              {about.eyebrow}
            </motion.p>
            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-11 lg:pl-10">
              <motion.h2
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-serif text-[clamp(2.6rem,4.8vw,5rem)] leading-[1.08] font-medium tracking-[-0.015em] lg:whitespace-nowrap"
              >
                {about.heading.lead}{" "}
                <em className="text-accent">{about.heading.emphasis}</em>
              </motion.h2>
              <motion.span
                className="hidden h-[86px] w-px origin-top bg-accent/60 lg:block"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                aria-hidden
              />
              <motion.p
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="max-w-[38em] text-[clamp(1.02rem,1.25vw,1.27rem)] leading-[1.4]"
              >
                {about.summary}
              </motion.p>
            </div>
          </div>

          {/* Cards either side of the scene; on small screens the scene comes first. */}
          <div className="mt-10 grid items-center gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,364fr)_minmax(0,880fr)_minmax(0,374fr)] xl:gap-0">
            <div className="md:col-span-2 xl:order-2 xl:col-span-1">
              <Stage />
            </div>
            <div className="xl:order-1">
              <SideCard side={about.professional} align="left" />
            </div>
            <div className="xl:order-3">
              <SideCard side={about.personal} align="right" />
            </div>
          </div>

          {/* At a glance */}
          <div className="relative z-10 mt-8 grid items-center gap-6 sm:grid-cols-2 lg:flex lg:justify-between lg:gap-0 lg:px-20">
            <motion.span
              {...fadeUp}
              transition={{ duration: 0.6 }}
              className="relative inline-flex w-fit flex-none items-center gap-3 overflow-hidden rounded-full bg-linear-to-b from-[#5b7330] to-accent-strong px-8 py-4 text-[1.1rem] font-medium whitespace-nowrap text-canvas shadow-[0_10px_24px_rgb(74_94_35/0.3),inset_0_1px_0_rgb(255_255_255/0.2)] sm:col-span-2"
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
                  className="flex items-center gap-4 lg:border-l lg:border-line lg:pl-12"
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                >
                  <StatIcon
                    className="size-10 flex-none text-accent"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <div>
                    <strong className="block text-[1.25rem] leading-tight font-semibold">
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
