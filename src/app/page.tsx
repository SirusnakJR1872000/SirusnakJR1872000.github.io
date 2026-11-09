import { ArrowRight, Box, CodeXml, Download, Layers, Leaf, Mail } from "lucide-react";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { Header } from "@/components/Header";
import { ProjectsSection } from "@/components/ProjectsSection";
import { BarsIcon } from "@/components/icons";
import { Reveal } from "@/components/Reveal";
import { WaveCanvas } from "@/components/WaveCanvas";
import { site } from "@/content/site";

const stats = [
  { ...site.stats.years, Icon: Layers },
  { ...site.stats.systems, Icon: CodeXml },
  { ...site.stats.expertise, Icon: Box },
  { ...site.stats.impact, Icon: BarsIcon },
];

const container = "mx-auto w-full max-w-[1720px] px-[clamp(16px,5.4vw,92px)]";
const card = "rounded-2xl border border-line bg-surface";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <section id="home" className="relative overflow-hidden">
          <WaveCanvas className="top-[4%] right-0 h-[55%] w-full opacity-35 lg:top-[11%] lg:h-[63%] lg:w-[60%] lg:opacity-100" />

          <div className={`${container} relative`}>
            <div className="pt-16 lg:pt-[72px] lg:pl-6">
              <p className="inline-flex items-center gap-3.5 rounded-full border border-line px-7 py-2 text-[1.2rem] tracking-[0.05em] lg:-ml-1.5">
                <Leaf
                  className="size-6 text-accent"
                  strokeWidth={1.6}
                  aria-hidden
                />
                {site.role}
              </p>

              <h1 className="mt-9 font-serif text-[clamp(2.75rem,4.2vw,4.4rem)] leading-[1.06] font-normal tracking-[-0.012em]">
                {site.headline.lines.map((line) => (
                  <span key={line}>
                    {line} <br className="max-lg:hidden" />
                  </span>
                ))}
                <em className="font-medium text-accent">
                  {site.headline.emphasis}
                </em>
              </h1>

              <p className="mt-10 max-w-[31em] text-[clamp(1.05rem,1.32vw,1.375rem)] leading-[1.55] text-ink-soft">
                {site.description}
              </p>

              <div className="mt-11 flex flex-wrap gap-4 sm:gap-7">
                <a
                  href="#projects"
                  className="inline-flex h-[58px] items-center justify-center gap-3.5 rounded-[10px] bg-accent px-11 text-[1.3rem] font-semibold text-canvas shadow-[0_8px_20px_rgb(74_94_35/0.22)] transition hover:-translate-y-0.5 hover:bg-accent-strong max-sm:flex-1"
                >
                  View My Work <ArrowRight className="size-5" aria-hidden />
                </a>
                <a
                  href={site.links.resume}
                  download="Gaurav-Patil-Resume.pdf"
                  className="inline-flex h-[58px] items-center justify-center gap-4 rounded-[10px] border border-[#cfc4b4] bg-canvas/60 px-9 text-[1.3rem] transition hover:-translate-y-0.5 hover:border-accent max-sm:flex-1"
                >
                  <Download className="size-5.5 text-accent" aria-hidden />{" "}
                  Download Resume
                </a>
              </div>
            </div>

            <ul className="grid gap-y-8 pt-[88px] pb-24 sm:grid-cols-2 lg:pl-6 wide:flex wide:justify-between">
              {stats.map(({ value, label, Icon }, index) => (
                <li
                  key={label}
                  className={`flex items-center gap-6 ${
                    index > 0
                      ? "wide:border-l wide:border-line wide:pl-[clamp(24px,3.3vw,55px)]"
                      : ""
                  }`}
                >
                  <Icon
                    className="size-12.5 flex-none text-accent"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                  <div>
                    <strong className="block font-serif text-[clamp(1.6rem,2vw,2.1rem)] leading-[1.15] font-semibold whitespace-nowrap">
                      {value}
                    </strong>
                    <span className="block text-[1.25rem] text-ink-soft">
                      {label}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <AboutSection />

        <ExperienceSection />

        <ProjectsSection />

        <section id="writing" className={`${container} mt-20`}>
          <Reveal>
            <h2 className="section-title">Writing</h2>
            {site.writing.length === 0 ? (
              <p className="mt-4 text-ink-muted">First articles coming soon.</p>
            ) : (
              <ul className="mt-8 grid gap-6 md:grid-cols-2">
                {site.writing.map((post) => (
                  <li key={post.href}>
                    <a
                      href={post.href}
                      className={`${card} block p-7 transition hover:border-accent`}
                    >
                      <h3 className="font-serif text-xl font-semibold">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-ink-soft">{post.summary}</p>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </section>

        <section id="contact" className={`${container} mt-20`}>
          <Reveal>
            <div
              className={`${card} grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14`}
            >
              <div>
                <h2 className="section-title">
                  Let&apos;s build something{" "}
                  <em className="text-accent">useful.</em>
                </h2>
                <p className="mt-3 text-ink-soft">
                  Open to AI/ML roles and collaborations. Email is the best way
                  to reach me.
                </p>
              </div>
              <div className="flex items-center lg:justify-end">
                <a
                  href={`mailto:${site.links.email}`}
                  className="inline-flex h-[58px] items-center justify-center gap-3 rounded-[10px] bg-accent px-9 text-[1.15rem] font-semibold text-canvas shadow-[0_8px_20px_rgb(74_94_35/0.22)] transition hover:-translate-y-0.5 hover:bg-accent-strong"
                >
                  <Mail className="size-5" aria-hidden /> Email Me
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer
        className={`${container} flex flex-wrap justify-between gap-3 py-10 text-sm text-ink-muted`}
      >
        <span>{site.name}</span>
        <a href="#home" className="transition-colors hover:text-accent">
          Back to top
        </a>
      </footer>
    </>
  );
}
