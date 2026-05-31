import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackgroundFX } from "@/components/BackgroundFX";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "PrepMate — Interview & Exam Prep",
  description:
    "PrepMate helps students and job seekers crack interviews and competitive exams. Face-to-face AI interviews, 5000+ exam questions (TCS, Infosys, UPSC, SSC, IBPS, SBI, GATE, CAT and more), adaptive practice, and instant scoring.",
  keywords: [
    "PrepMate",
    "interview preparation",
    "competitive exam practice",
    "mock interview",
    "TCS NQT",
    "IBPS",
    "SSC CGL",
    "UPSC",
    "GATE",
    "aptitude test",
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
