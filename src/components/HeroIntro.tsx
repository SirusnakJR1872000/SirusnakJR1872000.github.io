"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, Leaf } from "lucide-react";
import { AnimatePresence, MotionConfig, animate, motion } from "motion/react";
import { site } from "@/content/site";

const { role, description } = site;
const { lines, emphasis } = site.headline;

// Milliseconds per character. The long description types faster.
const segments = [
  { text: role, ms: 50 },
  ...lines.map((text) => ({ text, ms: 56 })),
  { text: emphasis, ms: 62 },
  { text: description, ms: 24 },
];
// Gives the MacBook time to rise into place first.
const START_DELAY = 800;
const PAUSE_BETWEEN = 200;

// When each character appears, in ms after the page loads.
const charTimes: number[] = [];
const segmentStarts: number[] = [];
let clock = START_DELAY;
for (const { text, ms } of segments) {
  segmentStarts.push(charTimes.length);
  for (let i = 0; i < text.length; i++) {
    clock += ms;
    charTimes.push(clock);
  }
  clock += PAUSE_BETWEEN;
}
const totalChars = charTimes.length;

// Plays once per visit, so returning from the resume page doesn't replay it.
let playedThisVisit = false;

/**
 * Reveals `text` letter by letter. Every letter is always in the page and only
 * changes from transparent to visible, so nothing moves, search engines and
 * screen readers get the full text, and browsers report no layout shift.
 */
function Typed({ index, count }: { index: number; count: number }) {
  const { text } = segments[index];
  const start = segmentStarts[index];
  const typing = count >= start && count < start + text.length;

  return (
    <>
      {[...text].map((char, i) => (
        <span
          key={i}
          className={
            start + i < count ? undefined : "typing-rest text-transparent"
          }
        >
          {typing && start + i === count && (
            // Out of the text flow, so it can't change where lines wrap.
            // The key restarts the blink, keeping it solid while typing.
            <span key={count} className="relative" aria-hidden>
              <span className="absolute top-[0.12em] -left-px h-[0.95em] w-[2px] animate-caret bg-accent motion-reduce:animate-none" />
            </span>
          )}
          {char}
        </span>
      ))}
    </>
  );
}

/** Bobbing arrow shown when typing ends; it leaves once the visitor scrolls. */
function ScrollCue({ show }: { show: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {show && !scrolled && (
          <motion.a
            href="#about"
            aria-label="Scroll down to About"
            className="fixed right-4 bottom-5 z-20 sm:right-auto sm:left-1/2 sm:-ml-[26px] grid size-[52px] place-items-center rounded-full border border-white/50 bg-white/45 text-accent shadow-[0_10px_30px_rgb(60_50_20/0.16),inset_0_1px_0_rgb(255_255_255/0.6)] ring-1 ring-black/[0.04] backdrop-blur-xl backdrop-saturate-[1.8] transition-colors hover:bg-accent hover:text-canvas"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <ArrowDown
              className="size-6 animate-scroll-cue motion-reduce:animate-none"
              strokeWidth={1.8}
              aria-hidden
            />
          </motion.a>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

type Mode = "laptop" | "expanding" | "full" | "collapsing";
type LidState = "open" | "closing" | "closed" | "opening";

const BEZEL = 10;
const ZOOM_SECONDS = 1;
const ZOOM_EASE = [0.76, 0, 0.24, 1] as const;
const LID_SECONDS = 1.1;

const frameDot =
  "relative size-[clamp(8px,1.5vw,12px)] cursor-pointer rounded-full transition-transform after:absolute after:-inset-x-[2px] after:-inset-y-2 hover:scale-125";

/** The dark frame, notch and window dots that stay put while the site scrolls inside. */
function FullScreenFrame({
  onClose,
  onMinimize,
}: {
  onClose: () => void;
  onMinimize: () => void;
}) {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute rounded-[18px] shadow-[0_0_0_40px_#161714]"
          style={{ inset: BEZEL }}
        />
        <div className="absolute top-0 left-1/2 flex h-[calc(10px+min(3.2vw,22px))] w-[min(17vw,118px)] -translate-x-1/2 items-center justify-center rounded-b-[8px] bg-[#161714] pt-[6px]">
          <span className="size-[min(0.9vw,6px)] rounded-full bg-[#34372f]" />
        </div>
      </div>
      <div
        className="fixed z-40 flex items-center gap-[clamp(6px,1vw,8px)]"
        style={{
          top: `calc(${BEZEL}px + min(2.6vw, 14px))`,
          left: `calc(${BEZEL}px + min(2.8vw, 18px))`,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close MacBook"
          title="Close MacBook"
          className={`${frameDot} bg-[#e8735f]`}
        />
        <button
          type="button"
          onClick={onMinimize}
          aria-label="Minimize to MacBook"
          title="Minimize to MacBook"
          className={`${frameDot} bg-[#e6b94f]`}
        />
        <button
          type="button"
          onClick={onMinimize}
          aria-label="Exit full screen"
          title="Exit full screen"
          className={`${frameDot} bg-[#7fa14b]`}
        />
      </div>
    </>
  );
}

/**
 * The hero's badge, headline and description, typed out on a MacBook. The green
 * window dot zooms the display to fill the browser, and the site then scrolls
 * inside the bezel. The screen's real size is animated, rather than a scale
 * transform, so the text stays sharp throughout.
 */
export function HeroIntro() {
  const [count, setCount] = useState(() => (playedThisVisit ? totalChars : 0));
  const [mode, setMode] = useState<Mode>("laptop");
  const [zoomedOnce, setZoomedOnce] = useState(false);
  const [lidState, setLidState] = useState<LidState>("open");
  const [typingRun, setTypingRun] = useState(0);
  const blackoutRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const slabRef = useRef<HTMLSpanElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const shutAfterCollapse = useRef(false);
  const start = useRef({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    padding: 0,
    radius: 0,
  });

  useEffect(() => {
    if (playedThisVisit && typingRun === 0) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // A replay skips most of the delay meant for the MacBook rising in.
    const begin = performance.now() - (typingRun ? START_DELAY - 250 : 0);
    let shown = 0;
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = reduced ? Infinity : now - begin;
      while (shown < totalChars && charTimes[shown] <= elapsed) shown++;
      setCount(shown);
      if (shown < totalChars) frame = requestAnimationFrame(tick);
      else playedThisVisit = true;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [typingRun]);

  const enterFullScreen = () => {
    const lid = lidRef.current;
    if (!lid || mode !== "laptop" || lidState !== "open") return;
    const box = lid.getBoundingClientRect();
    const style = getComputedStyle(lid);
    start.current = {
      top: box.top,
      left: box.left,
      width: box.width,
      height: box.height,
      padding: parseFloat(style.paddingTop),
      radius: parseFloat(style.borderTopLeftRadius),
    };
    setZoomedOnce(true);
    setMode("expanding");
  };

  const exitFullScreen = () => setMode("collapsing");

  // Red while full screen: go back to the MacBook, then shut it.
  const closeFromFullScreen = () => {
    shutAfterCollapse.current = true;
    setZoomedOnce(true);
    setMode("collapsing");
  };

  const closeLid = () => {
    if (mode === "laptop" && lidState === "open") {
      setZoomedOnce(true);
      setLidState("closing");
    }
  };

  // The lid folds on its own layer, so the text stays put and ends up on the page.
  useLayoutEffect(() => {
    const lid = lidRef.current;
    const shell = shellRef.current;
    const slab = slabRef.current;
    const blackout = blackoutRef.current;
    if (
      !lid ||
      !shell ||
      !slab ||
      !blackout ||
      lidState === "open" ||
      lidState === "closed"
    ) {
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduced ? 0 : LID_SECONDS;
    const closing = lidState === "closing";
    // Closing powers the screen off first; opening lights it back up.
    const blackSeconds = reduced ? 0 : 0.35;
    const foldDelay = closing ? blackSeconds : 0;
    animate(
      blackout,
      { opacity: closing ? [0, 1] : [1, 0] },
      { duration: blackSeconds, delay: closing ? 0 : duration * 0.45 },
    );
    const openAngle = 0;
    const shutAngle = -90;
    shell.style.padding = getComputedStyle(lid).paddingTop;

    animate(
      slab,
      { opacity: closing ? 1 : 0 },
      {
        duration: reduced ? 0 : 0.15,
        delay: closing ? foldDelay + duration * 0.85 : 0,
      },
    );
    const fold = animate(
      shell,
      {
        rotateX: closing ? [openAngle, shutAngle] : [shutAngle, openAngle],
        filter: closing
          ? ["brightness(1)", "brightness(0.7)"]
          : ["brightness(0.7)", "brightness(1)"],
      },
      { duration, delay: foldDelay, ease: [0.55, 0.05, 0.35, 1] },
    );
    let live = true;
    fold.then(() => {
      if (!live) return;
      setLidState(closing ? "closed" : "open");
      if (closing) {
        // The text types back in, now on the page above the shut laptop.
        setCount(0);
        setTypingRun((run) => run + 1);
      }
    });
    return () => {
      live = false;
      fold.stop();
    };
  }, [lidState]);

  useEffect(() => {
    if (mode !== "full") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMode("collapsing");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const slot = slotRef.current;
    const lid = lidRef.current;
    const spacer = spacerRef.current;
    const base = baseRef.current;
    if (!slot || !lid || !spacer || !base) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timing = { duration: reduced ? 0 : ZOOM_SECONDS, ease: ZOOM_EASE };
    const px = (n: number) => `${n}px`;

    if (mode === "laptop") {
      root.removeAttribute("data-mac");
      lid.style.cssText = "";
      base.style.cssText = "";
      spacer.style.height = "0";
      slot.style.height = "";
      return;
    }

    if (mode === "expanding") {
      root.dataset.mac = "on";
      const from = start.current;
      // The spacer holds the lid's place so the page behind doesn't move.
      spacer.style.height = px(from.height);
      Object.assign(lid.style, {
        top: px(from.top),
        left: px(from.left),
        width: px(from.width),
        height: px(from.height),
        padding: px(from.padding),
      });
      animate(base, { opacity: 0, y: 46 }, { duration: reduced ? 0 : 0.45 });
      const zoom = animate(
        lid,
        {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          padding: BEZEL,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
        timing,
      );
      let live = true;
      zoom.then(() => {
        if (!live) return;
        window.scrollTo({ top: 0, behavior: "instant" });
        setMode("full");
      });
      return () => {
        live = false;
        zoom.stop();
      };
    }

    if (mode === "full") {
      root.dataset.mac = "full";
      lid.style.cssText = "";
      spacer.style.height = "0";
      // The lid now sits at the very top of the page and scrolls with it.
      const place = () => {
        const parent = (lid.offsetParent ?? root).getBoundingClientRect();
        const top = slot.getBoundingClientRect().top + window.scrollY;
        lid.style.top = px(-(parent.top + window.scrollY));
        lid.style.left = px(-parent.left);
        lid.style.width = px(root.clientWidth);
        lid.style.height = "100dvh";
        slot.style.height = `calc(100dvh - ${top}px)`;
      };
      place();
      window.addEventListener("resize", place);
      return () => window.removeEventListener("resize", place);
    }

    // Collapsing: jump to the top behind the lid, then shrink back into the slot.
    root.removeAttribute("data-mac");
    slot.style.height = "";
    const wasScrolled = window.scrollY > 40;
    window.scrollTo({ top: 0, behavior: "instant" });

    const box = slot.getBoundingClientRect();
    const padding = box.width * 0.015;
    const width = box.width * 0.93;
    const ratio = window.innerWidth >= 640 ? 1.6 : 1.25;
    const height = (width - padding * 2) / ratio + padding * 2;
    const radius = Math.min(24, Math.max(12, window.innerWidth * 0.018));
    spacer.style.height = px(height);
    lid.style.cssText = "";
    Object.assign(lid.style, {
      top: "0px",
      left: "0px",
      width: px(window.innerWidth),
      height: px(window.innerHeight),
      padding: px(BEZEL),
    });

    let live = true;
    let shrink: ReturnType<typeof animate> | undefined;
    const fadeIn = animate(
      lid,
      { opacity: wasScrolled ? [0, 1] : [1, 1] },
      { duration: wasScrolled && !reduced ? 0.2 : 0 },
    );
    fadeIn.then(() => {
      if (!live) return;
      shrink = animate(
        lid,
        {
          top: box.top,
          left: box.left + box.width * 0.035,
          width,
          height,
          padding,
          borderTopLeftRadius: [0, radius],
          borderTopRightRadius: [0, radius],
        },
        timing,
      );
      animate(
        base,
        { opacity: [0, 1], y: [46, 0] },
        {
          duration: reduced ? 0 : 0.5,
          delay: reduced ? 0 : ZOOM_SECONDS * 0.6,
        },
      );
      shrink.then(() => {
        if (!live) return;
        setMode("laptop");
        if (shutAfterCollapse.current) {
          shutAfterCollapse.current = false;
          setLidState("closing");
        }
      });
    });
    return () => {
      live = false;
      fadeIn.stop();
      shrink?.stop();
    };
  }, [mode]);

  // Leaving the page while full screen must not leave the page styles behind.
  useEffect(
    () => () => document.documentElement.removeAttribute("data-mac"),
    [],
  );

  const isLaptop = mode === "laptop";
  const isFull = mode === "full";
  const typingDone = count >= totalChars;

  const lidOpen = lidState === "open";
  const bezel =
    "rounded-t-[clamp(12px,1.8vw,24px)] bg-linear-to-b from-[#2b2c28] to-[#161714] shadow-[0_30px_60px_rgb(40_40_15/0.28),inset_0_0_0_1px_rgb(255_255_255/0.12)]";
  const lidClass = isLaptop
    ? lidOpen
      ? `relative mx-[3.5%] p-[1.5%] ${bezel}`
      : "relative mx-[3.5%] p-[1.5%] [perspective-origin:50%_100%] [perspective:1400px]"
    : isFull
      ? "absolute z-20 flex flex-col bg-canvas p-[10px]"
      : "fixed z-20 flex flex-col bg-[#161714]";
  const screenClass = isLaptop
    ? `aspect-[5/4] rounded-t-[clamp(6px,1vw,13px)] sm:aspect-[16/10] ${
        lidOpen ? "bg-[#fbf7ef]" : ""
      }`
    : `min-h-0 flex-1 bg-canvas ${isFull ? "" : "rounded-[18px]"}`;

  return (
    <>
      {/* Without JavaScript, nothing would type, so show the text straight away. */}
      <noscript>
        <style>
          {".typing-rest{color:inherit}.animate-caret{display:none}"}
        </style>
      </noscript>

      <div
        ref={slotRef}
        className={`w-full lg:w-[clamp(540px,46vw,800px)] ${
          zoomedOnce ? "" : "animate-laptop-in motion-reduce:animate-none"
        }`}
      >
        <div ref={lidRef} className={lidClass}>
          {/* The part that folds shut: everything but the text */}
          {!lidOpen && (
            <div
              ref={shellRef}
              className={`absolute inset-0 origin-bottom ${bezel} ${
                lidState === "closed" ? "invisible" : ""
              }`}
              aria-hidden
            >
              <div className="relative h-full overflow-hidden rounded-t-[clamp(6px,1vw,13px)] bg-[#fbf7ef] [container-type:size]">
                <div
                  ref={blackoutRef}
                  className="absolute inset-0 z-10 bg-black opacity-0"
                />
                <span className="absolute top-0 left-1/2 z-20 h-[min(3.2cqw,22px)] w-[min(17cqw,118px)] -translate-x-1/2 rounded-b-[min(1.2cqw,8px)] bg-[#161714]" />
                <span className="absolute top-[min(2.6cqw,14px)] left-[min(2.8cqw,18px)] flex items-center gap-[min(1cqw,8px)]">
                  <span className="size-[min(1.5cqw,12px)] min-h-1.5 min-w-1.5 rounded-full bg-[#e8735f]" />
                  <span className="size-[min(1.5cqw,12px)] min-h-1.5 min-w-1.5 rounded-full bg-[#e6b94f]" />
                  <span className="size-[min(1.5cqw,12px)] min-h-1.5 min-w-1.5 rounded-full bg-[#7fa14b]" />
                </span>
              </div>
            </div>
          )}

          {/* The display is a size container, so the text scales with the MacBook. */}
          <div
            className={`mac-screen relative overflow-hidden transition-colors duration-700 ${screenClass}`}
          >
            {!isFull && lidOpen && (
              <span
                className="absolute top-0 left-1/2 z-10 flex h-[min(3.2cqw,22px)] w-[min(17cqw,118px)] -translate-x-1/2 items-center justify-center rounded-b-[min(1.2cqw,8px)] bg-[#161714]"
                aria-hidden
              >
                <span className="size-[min(0.9cqw,6px)] rounded-full bg-[#34372f]" />
              </span>
            )}

            {/* Window controls; red shuts the lid, green goes full screen */}
            <div
              className={`absolute top-[min(2.6cqw,14px)] left-[min(2.8cqw,18px)] z-10 flex items-center gap-[min(1cqw,8px)] transition-opacity duration-300 ${
                !lidOpen
                  ? "pointer-events-none opacity-0"
                  : isFull
                    ? "invisible"
                    : isLaptop
                      ? ""
                      : "pointer-events-none"
              }`}
            >
              <button
                type="button"
                onClick={closeLid}
                aria-label="Close MacBook"
                title="Close MacBook"
                className="relative size-[min(1.5cqw,12px)] min-h-1.5 min-w-1.5 cursor-pointer rounded-full bg-[#e8735f] transition-transform after:absolute after:-inset-2 hover:scale-150"
              />
              <span
                className="size-[min(1.5cqw,12px)] min-h-1.5 min-w-1.5 rounded-full bg-[#e6b94f]"
                aria-hidden
              />
              <button
                type="button"
                onClick={enterFullScreen}
                aria-label="Enter full screen"
                title="Enter full screen"
                className="relative size-[min(1.5cqw,12px)] min-h-1.5 min-w-1.5 cursor-pointer rounded-full bg-[#7fa14b] transition-transform after:absolute after:-inset-2 hover:scale-150"
              />
            </div>

            <div
              className={`flex h-full flex-col justify-center px-[6cqw] transition-[padding,opacity] ${
                isLaptop ? "duration-200" : "pt-[96px] duration-700"
              } ${lidState === "closing" ? "opacity-0" : ""}`}
            >
              <p className="inline-flex w-fit items-center gap-[0.55em] rounded-full border border-line px-[1.2em] py-[0.35em] text-[max(12px,min(2.3cqw,3.68cqh))] tracking-[0.05em]">
                <Leaf
                  className="size-[1.3em] flex-none text-accent"
                  strokeWidth={1.6}
                  aria-hidden
                />
                <span>
                  <Typed index={0} count={count} />
                </span>
              </p>

              <h1 className="mt-[min(3.2cqw,5.12cqh)] font-serif text-[min(8.6cqw,13.76cqh)] leading-[1.06] font-normal tracking-[-0.012em]">
                {lines.map((line, i) => (
                  <span key={line}>
                    <Typed index={i + 1} count={count} /> <br />
                  </span>
                ))}
                <em className="font-medium text-accent">
                  <Typed index={lines.length + 1} count={count} />
                </em>
              </h1>

              <p className="mt-[min(3.2cqw,5.12cqh)] text-[max(13px,min(2.75cqw,4.4cqh))] leading-[1.5] text-ink-soft">
                <Typed index={lines.length + 2} count={count} />
              </p>
            </div>
          </div>
        </div>

        <div ref={spacerRef} aria-hidden />

        {/* Base */}
        <div
          ref={baseRef}
          className={`relative aspect-[100/2.8] rounded-b-[clamp(8px,1.2vw,16px)] bg-linear-to-b from-[#e9e6dd] via-[#cfccc1] to-[#a5a297] shadow-[0_18px_30px_rgb(40_40_15/0.22),inset_0_1px_0_#fff] ${
            isFull ? "hidden" : ""
          }`}
        >
          <span
            className="absolute top-0 left-1/2 h-[42%] w-[15%] -translate-x-1/2 rounded-b-[10px] bg-linear-to-b from-[#b4b1a6] to-[#d6d3c9]"
            aria-hidden
          />
          {/* The shut lid, seen edge-on */}
          <span
            ref={slabRef}
            className="absolute inset-x-[0.6%] bottom-full h-[clamp(4px,0.45vw,7px)] rounded-t-[4px] bg-linear-to-b from-[#f1eee6] to-[#bdbab0] opacity-0"
            aria-hidden
          />
          {lidState === "closed" && (
            <button
              type="button"
              onClick={() => setLidState("opening")}
              aria-label="Open MacBook"
              title="Open MacBook"
              className="absolute inset-x-0 -inset-y-3 cursor-pointer rounded-[10px]"
            />
          )}
        </div>
      </div>

      {isFull && (
        <FullScreenFrame
          onClose={closeFromFullScreen}
          onMinimize={exitFullScreen}
        />
      )}

      <ScrollCue show={typingDone || zoomedOnce} />
    </>
  );
}
