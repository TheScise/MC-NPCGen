import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Minecraft NPC Generator",
  description: "Livestream tool for rolling Minecraft NPC characters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cinzel.variable}>
      <body className="min-h-screen bg-neutral-950 text-parchment">
        {children}
      </body>
    </html>
  );
}
