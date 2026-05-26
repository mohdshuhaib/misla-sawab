import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPublicMajlisBySlug,
  isActivityEnabled,
} from "@/lib/majlis/get-majlis";

import { KhatmulQuranClient } from "@/components/khatam/khatmul-quran-client";

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
      title: "Khatmul Qur’an Majlis not found | Misla Sawab",
    };
  }

  const titleMl = `${majlis.for_whom} അവർക്കുവേണ്ടിയുള്ള ഖത്ത്മുൽ ഖുർആൻ മജ്ലിസ്`;

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

export default async function KhatmulQuranPage({ params }: PageProps) {
  const { slug } = await params;
  const majlis = await getPublicMajlisBySlug(slug);

  if (!majlis || !isActivityEnabled(majlis, "khatmul_quran")) {
    notFound();
  }

  return (
    <KhatmulQuranClient
      roomId={majlis.id}
      slug={majlis.slug}
      title={majlis.title}
      forWhom={majlis.for_whom}
    />
  );
}