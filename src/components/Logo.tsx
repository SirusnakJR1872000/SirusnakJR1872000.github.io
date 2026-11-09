import type { SVGProps } from "react";

/**
 * The interlocking "GP" monogram with the green swoosh.
 * The letters use the site's serif (Newsreader); the swoosh has a cream
 * outline so it reads as cutting through the letters.
 */
export function Monogram({
  id,
  title = "Gaurav Patil",
  ...props
}: SVGProps<SVGSVGElement> & { id: string; title?: string }) {
  // Gradient ids must be unique when the monogram appears more than once.
  const letters = `${id}-letters`;
  const swoosh = `${id}-swoosh`;
  return (
    <svg viewBox="0 0 130 110" role="img" aria-label={title} {...props}>
      <defs>
        <linearGradient id={letters} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5b7330" />
          <stop offset="1" stopColor="#3a4b1b" />
        </linearGradient>
        <linearGradient id={swoosh} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#b5c06a" />
          <stop offset="0.55" stopColor="#93a447" />
          <stop offset="1" stopColor="#7d913a" />
        </linearGradient>
      </defs>
      {/* Newsreader's G is narrow; widening it gives the round G of the logo. */}
      <text
        transform="translate(2 84) scale(1.17 1)"
        className="font-serif"
        fontSize="104"
        fontWeight={500}
        fill={`url(#${letters})`}
      >
        G
      </text>
      <text
        x="52"
        y="100"
        className="font-serif"
        fontSize="92"
        fontWeight={500}
        fill={`url(#${letters})`}
      >
        P
      </text>
      <path
        d="M4 77C28 93 50 83 67 67C82 53 101 47 126 55C102 51 85 59 70 73C53 89 28 97 4 77Z"
        fill={`url(#${swoosh})`}
        stroke="var(--canvas)"
        strokeWidth={3}
        paintOrder="stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Monogram plus the spaced-out "GAURAV PATIL" wordmark, side by side. */
export function Logo({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-3">
      <Monogram
        id="logo-header"
        title=""
        aria-hidden
        className="h-10 w-auto flex-none sm:h-11"
      />
      <span className="flex flex-col items-center">
        <span className="font-serif text-[0.95rem] leading-none font-normal tracking-[0.2em] sm:tracking-[0.24em] whitespace-nowrap uppercase sm:text-[1.15rem]">
          {name}
        </span>
        <span className="mt-1.5 flex w-full items-center gap-[30%]" aria-hidden>
          <span className="h-px flex-1 bg-linear-to-r from-transparent to-accent/70" />
          <span className="h-px flex-1 bg-linear-to-l from-transparent to-accent/70" />
        </span>
      </span>
    </span>
  );
}
