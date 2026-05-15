import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HomeFlow CRM | Home service CRM for HVAC, plumbing, roofing, and more",
  description:
    "A vertical SaaS CRM prototype for home service businesses with scheduling, calls, SMS, contact management, and dispatch workflows.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body>{children}</body>
    </html>
  );
}
