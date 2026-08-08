import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Ini yang bakal muncul di tab browser & SEO Google
export const metadata: Metadata = {
  title: "Giziku - Asisten Nutrisi Cerdasmu",
  description: "Aplikasi pantau gizi, kalori, dan resep pintar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id" // Ganti ke id (Indonesia)
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Children ini nanti bakal otomatis keisi sama (landing) atau (dashboard) */}
        {children}
      </body>
    </html>
  );
}