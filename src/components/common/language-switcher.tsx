"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  function switchLanguage() {
    const nextLocale = locale === "ml" ? "en" : "ml";

    document.cookie = `MISLA_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;

    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-10 rounded-full border-emerald-200 bg-white/70 px-3 text-emerald-800 hover:bg-emerald-50"
      onClick={switchLanguage}
    >
      <Languages className="mr-1.5 h-4 w-4" />
      {locale === "ml" ? "EN" : "ML"}
    </Button>
  );
}