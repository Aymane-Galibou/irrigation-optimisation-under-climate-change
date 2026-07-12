import type { Metadata } from "next";
import "./globals.css"; 

export const metadata: Metadata = {
  title: "AgriPulse | Precision Irrigation",
  description: "Plateforme IA d'optimisation hydrique et de simulation agronomique",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="bg-zinc-50 text-zinc-900 antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}