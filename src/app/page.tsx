import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  MessageCircleHeart,
  Share2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MajlisSidebar } from "@/components/layout/majlis-sidebar";
import { CreateMajlisModal } from "@/components/majlis/create-majlis-modal";

const features = [
  {
    icon: BookOpen,
    title: "ഖത്ത്മുൽ ഖുർആൻ",
    description: "30 ജുസ് സുരക്ഷിതമായി തിരഞ്ഞെടുത്ത് പൂർത്തീകരണം കാണിക്കുക.",
  },
  {
    icon: MessageCircleHeart,
    title: "ദിക്റ് / അദ്കാർ",
    description: "ദിക്റ് തരം, എണ്ണം, സംഭാവകർ, മൊത്തം കണക്ക് എന്നിവ സൂക്ഷിക്കുക.",
  },
  {
    icon: HeartHandshake,
    title: "സൂറത്ത് പാരായണം",
    description: "ഫാത്തിഹ, യാസീൻ പാരായണങ്ങൾ പേര് സഹിതം രേഖപ്പെടുത്തുക.",
  },
  {
    icon: Share2,
    title: "WhatsApp Share",
    description: "മലയാളം ഇസ്ലാമിക് സന്ദേശത്തോടുകൂടി മജ്ലിസ് ലിങ്കുകൾ പങ്കിടുക.",
  },
];

export default function HomePage() {
  return (
    <main className="safe-container flex gap-6 py-6">
      <CreateMajlisModal />
      <MajlisSidebar />

      <section className="min-w-0 flex-1">
        <Card className="glass-card overflow-hidden rounded-[2rem] border-emerald-100">
          <CardContent className="relative p-6 sm:p-8 lg:p-12">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-700/10 blur-3xl" />

            <div className="relative max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
                <Sparkles className="h-4 w-4" />
                Malayalam-first Islamic contribution platform
              </div>

              <h1 className="text-4xl font-black tracking-tight text-emerald-950 dark:text-emerald-50 sm:text-5xl lg:text-6xl">
                നന്മയുടെ മജ്ലിസ് ഇനി ലളിതമായി നിയന്ത്രിക്കാം
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                ഖത്ത്മുൽ ഖുർആൻ, സൂറത്ത് പാരായണം, ദിക്റ് / അദ്കാർ സംഭാവനകൾ
                WhatsApp ഗ്രൂപ്പിൽ തിരക്കില്ലാതെ മനോഹരമായി ക്രമീകരിക്കാൻ
                Misla Sawab സഹായിക്കുന്നു.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-13 rounded-full bg-emerald-600 px-7 text-base text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                >
                  <Link href="/?create=majlis">
                    പുതിയ മജ്ലിസ് സൃഷ്ടിക്കുക
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-full border-emerald-200 bg-white/70 px-7 text-base text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
                >
                  <Link href="#features">സവിശേഷതകൾ കാണുക</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div id="features" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="glass-card rounded-[1.75rem] transition hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="p-5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                  <feature.icon className="h-5 w-5" />
                </div>

                <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">
                  {feature.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}