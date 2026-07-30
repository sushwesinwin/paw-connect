import type { Metadata } from "next";
import { Albert_Sans, Geist, Geist_Mono } from "next/font/google";
import { GooeyToaster } from "@/components/ui/goey-toaster";
import "./globals.css";
import "goey-toast/styles.css";

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paw Connect",
  description: "AI pet care assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${albertSans.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <GooeyToaster position="bottom-right" />
      </body>
    </html>
  );
}
