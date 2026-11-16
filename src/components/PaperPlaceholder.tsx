/** Blank animated sheet shown while the resume loads. */
export function PaperPlaceholder() {
  return (
    <div
      role="status"
      aria-label="Loading resume"
      className="mx-auto aspect-[8.5/11] w-full max-w-[900px] animate-pulse rounded-2xl border border-[#e4ddcc] bg-[#fffdf9] motion-reduce:animate-none"
    />
  );
}
