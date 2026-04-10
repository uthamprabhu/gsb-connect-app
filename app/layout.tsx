import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthSessionBootstrap } from "@/components/auth-session-bootstrap";
import { NotificationBootstrap } from "@/components/notification-bootstrap";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GSB Connect",
  description: "Gamified matchmaking MVP for meaningful connections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <AuthSessionBootstrap />
        {children}
        <NotificationBootstrap />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
