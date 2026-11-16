"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { PaperPlaceholder } from "@/components/PaperPlaceholder";
import { site } from "@/content/site";

// react-pdf requires this to be set in the same file that renders the PDF.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MAX_PAGE_WIDTH = 900;

/** Draws each page of the resume PDF as a sheet of paper. */
export default function ResumePages() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  // Match the screen exactly: rendering larger and shrinking blurs thin letters.
  const sharpness = Math.min(3, window.devicePixelRatio || 1);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.min(Math.floor(entry.contentRect.width), MAX_PAGE_WIDTH));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef}>
      <Document
        file={site.links.resume}
        externalLinkTarget="_blank"
        onLoadSuccess={({ numPages }) => setPageCount(numPages)}
        loading={<PaperPlaceholder />}
        error={
          <p role="alert" className="text-center text-ink-soft">
            The resume couldn&apos;t be displayed here. Please use the Download
            button above.
          </p>
        }
      >
        <div className="grid justify-center gap-7">
          {width > 0 &&
            Array.from({ length: pageCount }, (_, index) => (
              <motion.div
                key={index}
                className="overflow-hidden rounded-2xl border border-[#e4ddcc] bg-white shadow-[0_24px_60px_rgb(60_50_20/0.12)]"
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  ease: "easeOut",
                  delay: 0.1 + index * 0.15,
                }}
              >
                <Page
                  pageNumber={index + 1}
                  width={width}
                  devicePixelRatio={sharpness}
                  loading={<PaperPlaceholder />}
                />
              </motion.div>
            ))}
        </div>
      </Document>
    </div>
  );
}
