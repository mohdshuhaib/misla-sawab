import type { Metadata } from "next";

import { ManagerClient } from "@/components/manager/manager-client";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "Manager Panel | Misla Sawab",
  description: "Private manager panel for Misla Sawab Majlis.",
};

export default async function ManagerPage({ params }: PageProps) {
  const { slug } = await params;

  return <ManagerClient slug={slug} />;
}