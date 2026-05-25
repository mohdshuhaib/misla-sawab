import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "./globals.css";

import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL("https://YOUR-DOMAIN.vercel.app"),

  title: {
    default: "Misla Sawab | നന്മയുടെ മജ്ലിസ്",
    template: "%s | Misla Sawab",
  },

  description:
    "Misla Sawab is a Malayalam-first Islamic community web app for managing Khatmul Qur’an, Surah recitations, Dhikr / Adhkar, and good-deed contributions for a deceased person or a specific Islamic purpose.",

  applicationName: "Misla Sawab",

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Misla Sawab",
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    title: "Misla Sawab | നന്മയുടെ മജ്ലിസ്",
    description:
      "Create and share Malayalam-first Khatmul Qur’an, Dhikr / Adhkar, Surah Ya-Sin, and Surah Al-Fatihah contribution Majlis links.",
    url: "https://YOUR-DOMAIN.vercel.app",
    siteName: "Misla Sawab",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "Misla Sawab Logo",
      },
    ],
    locale: "ml_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Misla Sawab | നന്മയുടെ മജ്ലിസ്",
    description:
      "Malayalam-first Islamic community app for Khatmul Qur’an, Dhikr, Surah recitations, and good-deed contributions.",
    images: ["/web-app-manifest-512x512.png"],
  },

  keywords: [
    "Misla Sawab",
    "Khatmul Quran",
    "Khatmul Qur’an",
    "Dhikr",
    "Adhkar",
    "Surah Yaseen",
    "Surah Fathiha",
    "Malayalam Islamic app",
    "Majlis",
    "Quran recitation",
    "Muslim community app",
  ],
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
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
            <div className="min-h-screen islamic-pattern">
              <Navbar />
              {children}
            </div>

            <Toaster richColors position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}