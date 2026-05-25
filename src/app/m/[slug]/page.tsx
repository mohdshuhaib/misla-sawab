import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Heart, Sparkles } from "lucide-react";

import {
  getEnabledActivities,
  getPublicMajlisBySlug,
} from "@/lib/majlis/get-majlis";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicActivityGrid } from "@/components/majlis/public-activity-grid";
import { ShareButtonGroup } from "@/components/majlis/share-button-group";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const majlis = await getPublicMajlisBySlug(slug);

  if (!majlis) {
    return {
      title: "Majlis not found | Misla Sawab",
    };
  }

  const titleMl = `${majlis.for_whom} അവർക്കുവേണ്ടിയുള്ള മജ്ലിസ്`;
  const titleEn = `Majlis for ${majlis.for_whom}`;

  return {
    title: `${titleMl} | Misla Sawab`,
    description: majlis.purpose,
    openGraph: {
      title: titleMl,
      description: `${majlis.purpose} | Misla Sawab`,
      siteName: "Misla Sawab",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titleEn,
      description: majlis.purpose,
    },
  };
}

export default async function PublicMajlisPage({ params }: PageProps) {
  const { slug } = await params;
  const majlis = await getPublicMajlisBySlug(slug);

  if (!majlis) {
    notFound();
  }

  const enabledActivities = getEnabledActivities(majlis);

  return (
    <main className="safe-container py-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button
          asChild
          variant="ghost"
          className="rounded-full text-emerald-800 hover:bg-emerald-50 dark:text-emerald-100 dark:hover:bg-emerald-950"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ഹോമിലേക്ക് മടങ്ങുക
          </Link>
        </Button>

        <Card className="glass-card overflow-hidden rounded-[2.25rem] border-emerald-100">
          <CardContent className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-700/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
                <Sparkles className="h-4 w-4" />
                നന്മയുടെ മജ്ലിസ്
              </div>

              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-4xl lg:text-5xl">
                {majlis.title}
              </h1>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-emerald-100 bg-white/60 p-4 dark:border-emerald-900 dark:bg-slate-950/30">
                  <p className="text-sm text-muted-foreground">ആർക്കുവേണ്ടി</p>
                  <p className="mt-1 text-lg font-bold text-emerald-950 dark:text-emerald-50">
                    {majlis.for_whom}
                  </p>
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-white/60 p-4 dark:border-emerald-900 dark:bg-slate-950/30">
                  <p className="text-sm text-muted-foreground">
                    നിയ്യത്ത് / ഉദ്ദേശ്യം
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-950 dark:text-emerald-50">
                    {majlis.purpose}
                  </p>
                </div>
              </div>

              {majlis.description ? (
                <p className="mt-5 max-w-3xl rounded-3xl border border-emerald-100 bg-white/50 p-4 text-base leading-8 text-muted-foreground dark:border-emerald-900 dark:bg-slate-950/30">
                  {majlis.description}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
                  <Heart className="h-4 w-4" />
                  Public Contribution Majlis
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-emerald-800 dark:bg-slate-950/50 dark:text-emerald-100">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(majlis.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <ShareButtonGroup
          enabledActivities={enabledActivities}
          slug={majlis.slug}
          forWhom={majlis.for_whom}
          purpose={majlis.purpose}
        />

        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-black text-emerald-950 dark:text-emerald-50">
              പങ്കെടുക്കാൻ തിരഞ്ഞെടുക്കുക
            </h2>
            <p className="mt-1 text-muted-foreground">
              താഴെ കാണുന്ന പ്രവർത്തനങ്ങളിൽ നിങ്ങൾക്ക് സാധിക്കുന്നതിൽ പങ്കെടുക്കാം.
            </p>
          </div>

          <PublicActivityGrid
            slug={majlis.slug}
            enabledActivities={enabledActivities}
          />
        </section>
      </div>
    </main>
  );
}