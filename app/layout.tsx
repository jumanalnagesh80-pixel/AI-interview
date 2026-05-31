import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackgroundFX } from "@/components/BackgroundFX";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "AceTerview — AI-Powered Interview Coach",
  description:
    "The most advanced AI interview prep platform. Face-to-face AI interviews, resume analysis, voice & body language scoring, company simulators (Google, Amazon, TCS, Infosys), and real-time feedback.",
  keywords: [
    "AI interview",
    "mock interview",
    "resume analyzer",
    "face to face AI interview",
    "interview prep",
    "Google interview",
    "Amazon interview",
    "TCS interview",
    "Infosys interview",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink-950 text-white antialiased">
        <BackgroundFX />
        <ToastProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
