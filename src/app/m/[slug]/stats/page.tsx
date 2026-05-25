import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicMajlisBySlug } from "@/lib/majlis/get-majlis";

import { StatsClient } from "@/components/stats/stats-client";

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
      title: "Majlis Stats not found | Misla Sawab",
    };
  }

  const titleMl = `${majlis.for_whom} അവർക്കുവേണ്ടിയുള്ള മജ്ലിസ് കണക്കുകൾ`;

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

export default async function StatsPage({ params }: PageProps) {
  const { slug } = await params;
  const majlis = await getPublicMajlisBySlug(slug);

  if (!majlis) {
    notFound();
  }

  return (
    <StatsClient
      roomId={majlis.id}
      slug={majlis.slug}
      title={majlis.title}
      forWhom={majlis.for_whom}
      purpose={majlis.purpose}
    />
  );
}