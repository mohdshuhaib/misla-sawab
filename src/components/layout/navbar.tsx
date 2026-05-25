import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";

export async function Navbar() {
  const t = await getTranslations("app");

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/70 bg-white/70 backdrop-blur-xl">
      <div className="safe-container flex h-16 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNavDrawer />

          <Link href="/" className="flex min-w-0 items-center gap-2">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg shadow-emerald-600/20 ring-1 ring-emerald-100">
              <Image
                src="/logo.png"
                alt="Misla Sawab Logo"
                fill
                sizes="48px"
                priority
                className="object-contain p-1.5"
              />
            </div>

            <div className="min-w-0 leading-tight">
              <p className="truncate text-base font-bold text-emerald-950">
                {t("name")}
              </p>
              <p className="hidden text-xs text-emerald-700 sm:block">
                {t("tagline")}
              </p>
            </div>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />

          <Button
            asChild
            className="hidden rounded-full bg-emerald-600 px-5 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 sm:inline-flex"
          >
            <Link href="/?create=majlis">
              <Plus className="mr-2 h-4 w-4" />
              {t("createMajlis")}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}