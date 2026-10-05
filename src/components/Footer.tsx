import { profile } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-line px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>Built with Next.js, TypeScript and Tailwind, with help from Claude.</p>
      </div>
    </footer>
  );
}
