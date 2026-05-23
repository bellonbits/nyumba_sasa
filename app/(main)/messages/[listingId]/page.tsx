import ChatPageClient from "./ChatPageClient";

export async function generateStaticParams() {
  return [{ listingId: "1" }];
}

interface PageProps {
  params: Promise<{ listingId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ChatPageClient listingId={resolvedParams.listingId} />;
}
