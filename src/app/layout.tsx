import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";
import { getAppUrl } from "@/lib/utils/app-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: "Misla Sawab | നന്മയുടെ മജ്ലിസ്",
  description:
    "Malayalam-first community app for Qur’an recitation, Khatmul Qur’an, Surah recitations, and Dhikr / Adhkar contributions.",
  openGraph: {
    title: "Misla Sawab | നന്മയുടെ മജ്ലിസ്",
    description:
      "Create and share Qur’an, Khatmul Qur’an, Surah, and Dhikr contribution Majlis links.",
    siteName: "Misla Sawab",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <div className="min-h-screen islamic-pattern">
              <Navbar />
              {children}
            </div>

            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}