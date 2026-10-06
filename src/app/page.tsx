import { About } from "@/components/About";
import { Beyond } from "@/components/Beyond";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Process } from "@/components/Process";
import { Projects } from "@/components/Projects";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Skills } from "@/components/Skills";

export default function Home() {
  return (
    <>
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
        <About />
        <Beyond />
        <Projects />
        <Skills />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
