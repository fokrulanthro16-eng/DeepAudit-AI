import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepAudit AI - Enterprise Due-Diligence & Fact-Checking Engine",
  description:
    "Autonomous forensic fact-checking engine powered by Nebius Token Factory, NVIDIA Nemotron, and Tavily Search with SHA-256 evidence integrity proofs.",
  keywords: [
    "Nebius",
    "NVIDIA Nemotron",
    "Tavily",
    "Due Diligence",
    "Fact Checking",
    "AI Safety",
    "Enterprise Audit",
  ],
  authors: [{ name: "fokrulanthro16-eng" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070a12] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
