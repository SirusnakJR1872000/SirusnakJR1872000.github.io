"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

/** Counts a value like "10+" up from zero the first time it scrolls into view. */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  // The server renders the final value; the browser resets it to 0 and counts up.
  useEffect(() => {
    const el = ref.current;
    const match = value.match(/^(\d+)(.*)$/);
    if (
      !el ||
      !match ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const [, digits, suffix] = match;
    if (!inView) {
      el.textContent = `0${suffix}`;
      return;
    }
    const controls = animate(0, Number(digits), {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{value}</span>;
}
