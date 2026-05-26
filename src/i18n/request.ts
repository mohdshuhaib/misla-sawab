import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

type Locale = "ml" | "en";

function isValidLocale(locale: string | undefined): locale is Locale {
  return locale === "ml" || locale === "en";
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("MISLA_LOCALE")?.value;
  const locale: Locale = isValidLocale(cookieLocale) ? cookieLocale : "ml";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
