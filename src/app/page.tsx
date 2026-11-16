import Link from "next/link";
import { ArrowRight, Eye, Mail } from "lucide-react";
import { AboutSection } from "@/components/AboutSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { Header } from "@/components/Header";
import { HeroIntro } from "@/components/HeroIntro";
import { HeroStats } from "@/components/HeroStats";
import { ProjectsSection } from "@/components/ProjectsSection";
import { Reveal } from "@/components/Reveal";
import { WaveCanvas } from "@/components/WaveCanvas";
import { site } from "@/content/site";

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
            <div className="pt-8 lg:pt-7 lg:pl-6">
              <HeroIntro />

              <div className="mt-9 flex flex-wrap gap-4 sm:gap-7">
                <a
                  href="#projects"
                  className="inline-flex h-[58px] items-center justify-center gap-3.5 rounded-[10px] bg-accent px-11 text-[1.3rem] font-semibold text-canvas shadow-[0_8px_20px_rgb(74_94_35/0.22)] transition hover:-translate-y-0.5 hover:bg-accent-strong max-sm:flex-1"
                >
                  View My Work <ArrowRight className="size-5" aria-hidden />
                </a>
                <Link
                  href={site.links.resumePage}
                  className="inline-flex h-[58px] items-center justify-center gap-4 rounded-[10px] border border-[#cfc4b4] bg-canvas/60 px-9 text-[1.3rem] transition hover:-translate-y-0.5 hover:border-accent max-sm:flex-1"
                >
                  <Eye className="size-5.5 text-accent" aria-hidden /> My Resume
                </Link>
              </div>
            </div>

            <HeroStats />
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
