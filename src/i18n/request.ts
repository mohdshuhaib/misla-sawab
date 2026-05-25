import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("MISLA_LOCALE")?.value || "ml";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});