import type { Metadata } from "next";
import { Figtree, Newsreader } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const title = `${site.name} | AI/ML Engineer`;

export const metadata: Metadata = {
  title,
  description: site.description,
  openGraph: {
    title,
    description: site.description,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${newsreader.variable} antialiased`}>
      <body className="min-h-dvh overflow-x-hidden font-sans">{children}</body>
    </html>
  );
}
