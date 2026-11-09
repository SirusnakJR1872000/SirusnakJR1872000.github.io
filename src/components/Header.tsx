"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { site } from "@/content/site";

// Links to other sites open in a new tab so the portfolio stays open.
function external(href: string) {
  return href.startsWith("http")
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}

const navItems = [
  { label: "About", id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Writing", id: "writing" },
  { label: "Contact", id: "contact" },
];

// Frosted glass, in the style of Apple's floating toolbars.
const glass =
  "border border-white/50 bg-white/25 shadow-[0_10px_40px_rgb(60_50_20/0.08),inset_0_1px_0_rgb(255_255_255/0.6)] ring-1 ring-black/[0.04] backdrop-blur-xl backdrop-saturate-[1.8]";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("about");
  const [scrolled, setScrolled] = useState(false);

  // Highlights the nav item for the section in the middle of the screen.
  // The hero counts as "About", since it's the introduction.
  useEffect(() => {
    const ids = ["home", ...navItems.map((item) => item.id)];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id === "home" ? "about" : entry.target.id);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // The pill gets a stronger shadow once the page scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <header className="sticky top-0 z-30 px-3 pt-3 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',var(--font-figtree),sans-serif] sm:px-5 sm:pt-4">
        <nav
          aria-label="Main"
          className={`${glass} relative mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-4 rounded-full pr-2 pl-2.5 transition-shadow duration-300 sm:pl-3 ${
            scrolled
              ? "shadow-[0_14px_44px_rgb(60_50_20/0.16),inset_0_1px_0_rgb(255_255_255/0.8)]"
              : ""
          }`}
        >
          <a
            href="#home"
            aria-label={`${site.logoName}, back to top`}
            className="flex items-center rounded-full pr-2 pl-1"
          >
            <Logo name={site.logoName} />
          </a>

          <ul
            id="nav-links"
            className={`${menuOpen ? "flex" : "hidden"} absolute inset-x-0 top-[calc(100%+10px)] flex-col gap-1 rounded-3xl border border-white/70 bg-white/80 p-2 shadow-[0_10px_40px_rgb(60_50_20/0.12)] backdrop-blur-2xl xl:static xl:flex xl:flex-row xl:gap-1 xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none xl:backdrop-blur-none`}
          >
            {navItems.map(({ label, id }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active === id ? "true" : undefined}
                  className={`relative block rounded-full px-4 py-2.5 text-[0.98rem] transition-colors duration-300 xl:py-2 ${
                    active === id
                      ? "font-medium text-[#f7f2e2]"
                      : "text-ink-soft hover:bg-accent/[0.08] hover:text-accent-strong"
                  }`}
                >
                  {active === id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-linear-to-b from-[#6e8638] to-[#465a1f] shadow-[0_4px_14px_rgb(74_94_35/0.35),inset_0_1px_0_rgb(255_255_255/0.25)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                      aria-hidden
                    />
                  )}
                  <span className="relative">{label}</span>
                </a>
              </li>
            ))}
            {/* On phones the social links live in the menu to leave room for the logo. */}
            <li className="mt-1 flex gap-2 border-t border-black/5 px-2 pt-2 sm:hidden">
              <a
                href={site.links.linkedin}
                {...external(site.links.linkedin)}
                aria-label="LinkedIn"
                className="grid size-10 place-items-center rounded-full hover:text-accent"
              >
                <LinkedinIcon className="size-5" aria-hidden />
              </a>
              <a
                href={site.links.github}
                {...external(site.links.github)}
                aria-label="GitHub"
                className="grid size-10 place-items-center rounded-full hover:text-accent"
              >
                <GithubIcon className="size-5" aria-hidden />
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href={site.links.linkedin}
              {...external(site.links.linkedin)}
              aria-label="LinkedIn"
              className="hidden size-10 place-items-center rounded-full transition-colors hover:bg-black/[0.05] hover:text-accent sm:grid"
            >
              <LinkedinIcon className="size-5" aria-hidden />
            </a>
            <a
              href={site.links.github}
              {...external(site.links.github)}
              aria-label="GitHub"
              className="hidden size-10 place-items-center rounded-full transition-colors hover:bg-black/[0.05] hover:text-accent sm:grid"
            >
              <GithubIcon className="size-5" aria-hidden />
            </a>
            <a
              href="#contact"
              className="ml-1 hidden h-12 items-center gap-2 rounded-full bg-linear-to-b from-[#5b7330] to-accent-strong px-6 text-[0.98rem] font-medium whitespace-nowrap text-canvas shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_6px_16px_rgb(74_94_35/0.28)] transition hover:brightness-110 sm:inline-flex"
            >
              Get in Touch <ArrowUpRight className="size-4" aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="nav-links"
              className="grid size-11 cursor-pointer place-items-center rounded-full bg-white/70 transition-colors hover:text-accent xl:hidden"
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </nav>
      </header>
    </MotionConfig>
  );
}
