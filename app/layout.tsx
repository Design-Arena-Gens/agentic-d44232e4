import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Forge | AI Prompt Maker",
  description:
    "Design high-impact AI prompts with contextual intelligence, guided structures, and export-ready templates."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-slate-100">{children}</body>
    </html>
  );
}
