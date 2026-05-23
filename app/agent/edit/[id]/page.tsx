import EditListingPageClient from "./EditListingPageClient";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <EditListingPageClient id={resolvedParams.id} />;
}
