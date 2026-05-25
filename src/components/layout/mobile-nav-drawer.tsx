"use client";

import Link from "next/link";
import { Menu, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { NAV_LINKS } from "@/lib/constants/app";

export function MobileNavDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[86vw] max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            Misla Sawab
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-3">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              className="h-12 w-full justify-start rounded-2xl text-base"
            >
              <Link href={link.href}>{link.labelMl}</Link>
            </Button>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <LanguageSwitcher />

          <Button
            asChild
            className="h-12 w-full rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Link href="/?create=majlis">
              <Plus className="mr-2 h-4 w-4" />
              പുതിയ മജ്ലിസ് സൃഷ്ടിക്കുക
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}