"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { Logo } from "@/components/Logo";
import { PaperPlaceholder } from "@/components/PaperPlaceholder";
import { WaveCanvas } from "@/components/WaveCanvas";
import { site } from "@/content/site";

// The PDF library needs the browser, so it can't be prerendered.
const ResumePages = dynamic(() => import("@/components/ResumePages"), {
  ssr: false,
  loading: () => <PaperPlaceholder />,
});

const downloadName = "Gaurav-Patil-Resume.pdf";

export function ResumeViewer() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-hidden">
        <WaveCanvas className="top-0 right-0 hidden h-[420px] w-[50%] opacity-60 lg:block" />
        <WaveCanvas
          flip
          className="top-[300px] left-0 hidden h-[360px] w-[40%] opacity-40 lg:block"
        />

        <header className="sticky top-0 z-30 px-3 pt-3 sm:px-5 sm:pt-4">
          <nav
            aria-label="Resume"
            className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-3 rounded-full border border-white/50 bg-white/25 pr-2 pl-2.5 shadow-[0_10px_40px_rgb(60_50_20/0.08),inset_0_1px_0_rgb(255_255_255/0.6)] ring-1 ring-black/[0.04] backdrop-blur-xl backdrop-saturate-[1.8] sm:pl-3"
          >
            <Link
              href="/"
              aria-label={`${site.logoName}, back to portfolio`}
              className="flex items-center rounded-full pr-2 pl-1"
            >
              <Logo name={site.logoName} />
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden h-12 items-center gap-2 rounded-full px-5 text-[0.98rem] text-ink-soft transition-colors hover:bg-accent/[0.08] hover:text-accent-strong md:inline-flex"
              >
                <ArrowLeft className="size-4.5" aria-hidden />
                Back to portfolio
              </Link>
              <a
                href={site.links.resume}
                download={downloadName}
                aria-label="Download resume"
                className="inline-flex size-12 items-center justify-center gap-2 rounded-full bg-linear-to-b from-[#5b7330] to-accent-strong text-[0.98rem] font-medium whitespace-nowrap text-canvas shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_6px_16px_rgb(74_94_35/0.28)] transition hover:brightness-110 sm:w-auto sm:px-6"
              >
                <Download className="size-5" aria-hidden />
                <span className="hidden sm:inline">Download</span>
              </a>
            </div>
          </nav>
        </header>

        <main className="relative mx-auto w-full max-w-[1000px] px-4 pt-14 pb-24 sm:px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="flex items-center justify-center gap-4 text-lg font-semibold tracking-[0.2em] text-accent uppercase">
              <span className="h-px w-10 bg-accent" aria-hidden />
              Resume
              <span className="h-px w-10 bg-accent" aria-hidden />
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.6rem,5vw,4.25rem)] leading-[1.08] font-medium tracking-[-0.015em]">
              My <em className="text-accent">Resume</em>
            </h1>
          </motion.div>

          <div className="mt-10">
            <ResumePages />
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
