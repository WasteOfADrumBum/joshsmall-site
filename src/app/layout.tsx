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

// Icons come from the favicon, icon and apple-icon files in this folder. The share image is set
// here rather than with opengraph-image.png because Turbopack drops that file's alt text.
export const metadata: Metadata = {
  metadataBase: new URL("https://onesmall.company"),
  alternates: { canonical: "/" },
  title: `${profile.name} | ${profile.title}`,
  description,
  openGraph: {
    title: `${profile.name} | ${profile.title}`,
    description,
    type: "website",
    url: "/",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} ${geistMono.variable} antialiased`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
