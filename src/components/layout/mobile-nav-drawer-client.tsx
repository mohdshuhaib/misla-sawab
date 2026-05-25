"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, HeartHandshake, Home, Menu, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import type { MajlisListItem } from "@/lib/majlis/list-majlis";
import { NAV_LINKS } from "@/lib/constants/app";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileNavDrawerClientProps = {
  activeMajlis: MajlisListItem[];
};

export function MobileNavDrawerClient({
  activeMajlis,
}: MobileNavDrawerClientProps) {
  const app = useTranslations("app");
  const [open, setOpen] = useState(false);

  function closeDrawer() {
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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

      <SheetContent
        side="left"
        className="flex h-dvh w-[88vw] max-w-sm flex-col overflow-hidden p-0"
      >
        <div className="border-b border-emerald-100 p-5">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3 text-left">
              <span className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100">
                <Image
                  src="/logo.png"
                  alt="Misla Sawab Logo"
                  fill
                  sizes="48px"
                  className="object-contain p-1.5"
                />
              </span>

              <span className="leading-tight">
                <span className="block text-base font-black text-emerald-950">
                  {app("name")}
                </span>
                <span className="block text-xs font-medium text-emerald-700">
                  {app("tagline")}
                </span>
              </span>
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="shrink-0 space-y-3 p-5">
          {NAV_LINKS.map((link) => (
            <Button
              key={link.id}
              asChild
              variant="ghost"
              className="h-12 w-full justify-start rounded-2xl text-base"
              onClick={closeDrawer}
            >
              <Link href={link.href}>
                <Home className="mr-2 h-4 w-4" />
                {link.labelMl}
              </Link>
            </Button>
          ))}

          <Button
            asChild
            className="h-12 w-full rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={closeDrawer}
          >
            <Link href="/?create=majlis">
              <Plus className="mr-2 h-4 w-4" />
              {app("createMajlisFull")}
            </Link>
          </Button>
        </div>

        <div className="min-h-0 flex-1 border-t border-emerald-100 px-5 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-emerald-950">
                മജ്ലിസ് ലിസ്റ്റ്
              </p>
              <p className="text-xs text-muted-foreground">സജീവ മജ്ലിസുകൾ</p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {activeMajlis.length}
            </span>
          </div>

          <div className="h-full overflow-y-auto pr-1">
            {activeMajlis.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-sm leading-6 text-muted-foreground">
                ഇതുവരെ സജീവ മജ്ലിസുകളില്ല. പുതിയ മജ്ലിസ് സൃഷ്ടിക്കൂ.
              </div>
            ) : (
              <div className="space-y-3 pb-8">
                {activeMajlis.map((majlis) => (
                  <Link
                    key={majlis.id}
                    href={`/m/${majlis.slug}`}
                    onClick={closeDrawer}
                    className="block rounded-3xl border border-emerald-100 bg-white/80 p-4 transition hover:bg-emerald-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                        <BookOpen className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-bold text-emerald-950">
                          {majlis.title}
                        </p>

                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {majlis.purpose}
                        </p>

                        <p className="mt-2 line-clamp-1 text-xs font-medium text-emerald-700">
                          {majlis.for_whom}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-emerald-100 p-5">
          <div className="rounded-3xl bg-emerald-600 p-4 text-white">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4" />
              <p className="text-sm font-semibold">Misla Sawab</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-emerald-50">
              ഖുർആൻ, ദിക്റ്, അദ്കാർ സംഭാവനകൾ ലളിതമായി ക്രമീകരിക്കുക.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}