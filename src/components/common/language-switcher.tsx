"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  function switchLanguage() {
    const currentCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("MISLA_LOCALE="));

    const currentLocale = currentCookie?.split("=")[1] || "ml";
    const nextLocale = currentLocale === "ml" ? "en" : "ml";

    document.cookie = `MISLA_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    window.location.reload();
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 rounded-full border-emerald-200 bg-white/70 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
      onClick={switchLanguage}
    >
      <Languages className="mr-2 h-4 w-4" />
      ML / EN
    </Button>
  );
}