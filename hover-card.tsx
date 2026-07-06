import { GalleryPage } from '@/components/gallery/gallery-page';

export default function WeddingGalleryPage({ params }: { params: { slug: string } }) {
  return <GalleryPage slug={params?.slug ?? ''} />;
}
