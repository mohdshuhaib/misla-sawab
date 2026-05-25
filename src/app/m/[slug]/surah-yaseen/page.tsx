import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPublicMajlisBySlug,
  isActivityEnabled,
} from "@/lib/majlis/get-majlis";

import { SurahClient } from "@/components/surah/surah-client";

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
      title: "Surah Ya-Sin Majlis not found | Misla Sawab",
    };
  }

  const titleMl = `${majlis.for_whom} അവർക്കുവേണ്ടിയുള്ള സൂറത്ത് യാസീൻ മജ്ലിസ്`;

  return {
    title: `${titleMl} | Misla Sawab`,
    description: majlis.purpose,
    openGraph: {
      title: titleMl,
      description: `${majlis.purpose} | Misla Sawab`,
      siteName: "Misla Sawab",
      type: "website",
    },
  };
}

export default async function SurahYaseenPage({ params }: PageProps) {
  const { slug } = await params;
  const majlis = await getPublicMajlisBySlug(slug);

  if (!majlis || !isActivityEnabled(majlis, "yaseen")) {
    notFound();
  }

  return (
    <SurahClient
      roomId={majlis.id}
      slug={majlis.slug}
      title={majlis.title}
      forWhom={majlis.for_whom}
      purpose={majlis.purpose}
      activityType="yaseen"
    />
  );
}