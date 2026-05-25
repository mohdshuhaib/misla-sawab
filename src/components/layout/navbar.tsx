import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100/70 bg-white/70 backdrop-blur-xl dark:border-emerald-900/60 dark:bg-slate-950/60">
      <div className="safe-container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileNavDrawer />

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="leading-tight">
              <p className="text-base font-bold text-emerald-950 dark:text-emerald-50">
                Misla Sawab
              </p>
              <p className="hidden text-xs text-emerald-700 dark:text-emerald-300 sm:block">
                നന്മയുടെ മജ്ലിസ്
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <ThemeToggle />

          <Button
            asChild
            className="rounded-full bg-emerald-600 px-5 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            <Link href="/?create=majlis">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">പുതിയ മജ്ലിസ്</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}