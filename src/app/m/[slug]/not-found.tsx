import Link from "next/link";
import { SearchX } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function MajlisNotFoundPage() {
  const t = await getTranslations("notFound");

  return (
    <main className="safe-container flex min-h-[calc(100vh-5rem)] items-center justify-center py-10">
      <Card className="glass-card max-w-xl rounded-[2rem] text-center">
        <CardContent className="p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
            <SearchX className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-black text-emerald-950 dark:text-emerald-50">
            {t("title")}
          </h1>

          <p className="mt-3 leading-7 text-muted-foreground">
            {t("description")}
          </p>

          <Button
            asChild
            className="mt-6 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Link href="/">{t("goHome")}</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
