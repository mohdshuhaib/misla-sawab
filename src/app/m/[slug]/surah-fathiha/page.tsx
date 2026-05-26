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
      title: "Fathiha + Ikhlas + Falaq + Naas Majlis not found | Misla Sawab",
    };
  }

  const titleMl = `${majlis.for_whom} - Fathiha + Ikhlas + Falaq + Naas Majlis`;

  return {
    title: `${titleMl} | Misla Sawab`,
    description: majlis.description || majlis.title,
    openGraph: {
      title: titleMl,
      description: `${majlis.description || majlis.title} | Misla Sawab`,
      siteName: "Misla Sawab",
      type: "website",
    },
  };
}

export default async function SurahFathihaPage({ params }: PageProps) {
  const { slug } = await params;
  const majlis = await getPublicMajlisBySlug(slug);

  if (!majlis || !isActivityEnabled(majlis, "fathiha")) {
    notFound();
  }

  return (
    <SurahClient
      roomId={majlis.id}
      slug={majlis.slug}
      title={majlis.title}
      forWhom={majlis.for_whom}
      activityType="fathiha"
    />
  );
}