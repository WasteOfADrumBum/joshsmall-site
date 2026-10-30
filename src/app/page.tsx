import { About } from "@/components/About";
import { Beyond } from "@/components/Beyond";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HumanSide } from "@/components/HumanSide";
import { Nav } from "@/components/Nav";
import { Process } from "@/components/Process";
import { Projects } from "@/components/Projects";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Skills } from "@/components/Skills";
import { Stance } from "@/components/Stance";
import { career, profile } from "@/content/site";
import { homeJsonLd, serializeJsonLd } from "@/lib/structured-data";

// Experience counts in About are calculated at render; regenerate daily so they stay current.
export const revalidate = 86400;

const jsonLd = homeJsonLd({
  name: profile.name,
  title: profile.title,
  description: profile.intro,
  photo: profile.photo,
  location: profile.location,
  employer: career.employer,
  profiles: [profile.github, profile.linkedin],
});

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-bg"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Nav />
      {/* Slide-in animations start off to the side; clipping here stops them widening the page on phones. */}
      <main id="main" className="overflow-x-clip">
        <Hero />
        <Stance />
        <About />
        <Projects />
        <Skills />
        <HumanSide />
        <Experience />
        <Process />
        <Beyond />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
