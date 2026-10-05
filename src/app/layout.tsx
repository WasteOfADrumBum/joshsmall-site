import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/Reveal";
import { profile } from "@/content/site";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description = `${profile.name} is a full-stack software engineer building reliable TypeScript, React and Node.js applications.`;

export const metadata: Metadata = {
  title: `${profile.name} | ${profile.title}`,
  description,
  openGraph: {
    title: `${profile.name} | ${profile.title}`,
    description,
    type: "website",
    images: [{ url: profile.photo, alt: profile.photoAlt }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} ${geistMono.variable} antialiased`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
