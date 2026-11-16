import { ArrowLeft, Check, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GitHubIcon } from "@/components/Icons";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { profile } from "@/content/site";

// Only the case studies in src/content/case-studies.ts exist; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  const title = `${study.title} case study | ${profile.name}`;
  const path = `/work/${study.slug}`;
  return {
    title,
    description: study.summary,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: study.summary,
      type: "article",
      url: path,
      siteName: profile.name,
      locale: "en_US",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          type: "image/png",
          alt: `${profile.name}, ${profile.title}, onesmall.company, with a portrait in glasses, a top knot and a long full beard.`,
        },
      ],
    },
  };
}

export default async function CaseStudyPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-bg"
      >
        Skip to content
      </a>
      <header className="border-b border-line">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-5 sm:px-8"
        >
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-accent">J</span>oshua <span className="text-accent-2">M</span>.{" "}
            <span className="text-accent-3">S</span>mall
          </Link>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft aria-hidden="true" size={16} /> All projects
          </Link>
        </nav>
      </header>

      <main id="main" className="px-5 py-16 sm:px-8 md:py-24">
        <article className="mx-auto max-w-4xl">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">Case study</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-6xl">{study.title}</h1>
          <div aria-hidden="true" className="grad-border mt-6 h-1 w-24 rounded-full" />
          <p className="mt-8 text-xl leading-relaxed text-fg">{study.summary}</p>

          <dl className="mt-10 grid gap-6 rounded-3xl border border-line bg-surface p-7 sm:grid-cols-2 sm:p-8">
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-accent">My role</dt>
              <dd className="mt-2 text-muted">{study.role}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-accent">Status</dt>
              <dd className="mt-2 text-muted">{study.status}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-mono text-xs uppercase tracking-widest text-accent">Built with</dt>
              <dd className="mt-3">
                <ul aria-label="Technology used" className="flex flex-wrap gap-2">
                  {study.stack.map((s) => (
                    <li key={s} className="rounded-full bg-bg px-3 py-1 font-mono text-sm text-muted">
                      {s}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            {study.liveUrl && (
              <a
                href={study.liveUrl}
                className="btn-grad inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
              >
                {study.liveLabel ?? "View live"} <ExternalLink aria-hidden="true" size={18} />
                <span className="sr-only">(opens {study.title})</span>
              </a>
            )}
            <a
              href={study.repoUrl}
              className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-semibold transition-colors hover:border-accent hover:bg-surface"
            >
              <GitHubIcon className="size-5" /> Source code
              <span className="sr-only">for {study.title}</span>
            </a>
          </div>

          {study.sections.map((section) => (
            <section key={section.heading} className="mt-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{section.heading}</h2>
              {section.body?.map((p) => (
                <p key={p} className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">
                  {p}
                </p>
              ))}
              {section.points && (
                <ul className="mt-6 space-y-3">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-3 text-lg text-muted">
                      <Check aria-hidden="true" className="mt-1.5 size-5 shrink-0 text-accent" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <nav aria-label="More case studies" className="mt-20 border-t border-line pt-10">
            <h2 className="text-2xl font-bold tracking-tight">More case studies</h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {caseStudies
                .filter((c) => c.slug !== study.slug)
                .map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/work/${c.slug}`}
                      className="inline-flex items-center rounded-full border border-line px-5 py-3 font-semibold transition-colors hover:border-accent hover:bg-surface"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              <li>
                <Link
                  href="/#projects"
                  className="inline-flex items-center rounded-full border border-line px-5 py-3 font-semibold transition-colors hover:border-accent hover:bg-surface"
                >
                  All projects
                </Link>
              </li>
            </ul>
          </nav>
        </article>
      </main>
      <Footer />
    </>
  );
}
