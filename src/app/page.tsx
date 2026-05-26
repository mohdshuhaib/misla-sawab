import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  MessageCircleHeart,
  Share2,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MajlisSidebar } from "@/components/layout/majlis-sidebar";
import { CreateMajlisModal } from "@/components/majlis/create-majlis-modal";

export default async function HomePage() {
  const app = await getTranslations("app");
  const home = await getTranslations("home");
  const activities = await getTranslations("activities");

  const features = [
    {
      icon: BookOpen,
      title: activities("khatmulQuran"),
      description: activities("khatmulQuranDescription"),
    },
    {
      icon: MessageCircleHeart,
      title: activities("dhikr"),
      description: activities("dhikrDescription"),
    },
    {
      icon: HeartHandshake,
      title: `${activities("fathiha")} / ${activities("yaseen")}`,
      description: activities("surahDescription"),
    },
    {
      icon: Share2,
      title: home("whatsappShare"),
      description: activities("shareDescription"),
    },
  ];

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
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800">
                {home("badge")}
              </div>

              <h1 className="text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl">
                {home("title")}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {home("description")}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-13 rounded-full bg-emerald-600 px-7 text-base text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                >
                  <Link href="/?create=majlis">
                    {app("createMajlisFull")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-full border-emerald-200 bg-white/70 px-7 text-base text-emerald-800 hover:bg-emerald-50"
                >
                  <Link href="#features">{home("viewFeatures")}</Link>
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
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <feature.icon className="h-5 w-5" />
                </div>

                <h2 className="text-lg font-bold text-emerald-950">
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
