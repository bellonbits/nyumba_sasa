import ListingDetailPageClient from "./ListingDetailPageClient";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ListingDetailPageClient id={resolvedParams.id} />;
}
