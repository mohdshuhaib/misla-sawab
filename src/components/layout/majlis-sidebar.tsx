import Link from "next/link";
import { BookOpen, HeartHandshake, Home } from "lucide-react";

import { getActiveMajlisList } from "@/lib/majlis/list-majlis";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { BRAND } from "@/lib/constants/brand";

export async function MajlisSidebar() {
  const activeMajlis = await getActiveMajlisList();

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-80 shrink-0 lg:block">
      <Card className="glass-card flex h-full flex-col rounded-[2rem] p-4">
        <div className="mb-5 flex items-center gap-3 px-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100">
            <Image
              src={BRAND.logo}
              alt={`${BRAND.name} Logo`}
              fill
              sizes="48px"
              className="object-contain p-1.5"
            />
          </div>

          <div>
            <p className="font-bold text-emerald-950 dark:text-emerald-50">
              മജ്ലിസ് ലിസ്റ്റ്
            </p>
            <p className="text-sm text-muted-foreground">സജീവ മജ്ലിസുകൾ</p>
          </div>
        </div>

        <nav className="space-y-2">
          <Button
            asChild
            variant="ghost"
            className="h-12 w-full justify-start rounded-2xl"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              ഹോം
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="h-12 w-full justify-start rounded-2xl"
          >
            <Link href="/?create=majlis">
              <HeartHandshake className="mr-2 h-4 w-4" />
              പുതിയ മജ്ലിസ്
            </Link>
          </Button>
        </nav>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Active Majlis
          </p>

          {activeMajlis.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/50 p-4 text-sm leading-6 text-muted-foreground dark:border-emerald-800 dark:bg-slate-950/30">
              ഇതുവരെ സജീവ മജ്ലിസുകളില്ല. പുതിയ മജ്ലിസ് സൃഷ്ടിക്കൂ.
            </div>
          ) : (
            <div className="space-y-3">
              {activeMajlis.map((majlis) => (
                <Link
                  key={majlis.id}
                  href={`/m/${majlis.slug}`}
                  className="block rounded-3xl border border-emerald-100 bg-white/60 p-4 transition hover:-translate-y-0.5 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                      <BookOpen className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="line-clamp-2 text-sm font-semibold text-emerald-950 dark:text-emerald-50">
                        {majlis.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {majlis.purpose}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-3xl bg-emerald-600 p-4 text-white">
          <p className="text-sm font-semibold">Misla Sawab</p>
          <p className="mt-1 text-xs leading-5 text-emerald-50">
            ഖുർആൻ, ദിക്റ്, അദ്കാർ സംഭാവനകൾ ഒരിടത്ത് ലളിതമായി ക്രമീകരിക്കുക.
          </p>
        </div>
      </Card>
    </aside>
  );
}