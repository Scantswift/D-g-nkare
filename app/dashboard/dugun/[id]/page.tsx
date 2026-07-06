import { WeddingDetail } from '@/components/dashboard/wedding-detail';

export default function WeddingDetailPage({ params }: { params: { id: string } }) {
  return <WeddingDetail weddingId={params?.id ?? ''} />;
}
