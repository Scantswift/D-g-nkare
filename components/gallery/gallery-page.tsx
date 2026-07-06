'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Upload, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Photo {
  id: string;
  url: string;
  fileName: string;
  uploaderName: string;
  createdAt: string;
}

interface Wedding {
  id: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venue: string;
  photos: Photo[];
}

export function GalleryPage({ slug }: { slug: string }) {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState('');

  useEffect(() => {
    const fetchWedding = async () => {
      try {
        const res = await fetch(`/api/gallery/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setWedding(data);
        } else {
          setWedding(null);
        }
      } catch {
        setWedding(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchWedding();
    }
  }, [slug]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !wedding) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Get presigned URL
        const presignRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            isPublic: true,
          }),
        });

        if (!presignRes.ok) throw new Error('Upload URL alınamadı');

        const { uploadUrl, cloudStoragePath } = await presignRes.json();

        // Upload to S3
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        // Record photo
        await fetch(`/api/gallery/${slug}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cloudStoragePath,
            fileName: file.name,
            contentType: file.type,
            uploaderName,
            isPublic: true,
          }),
        });
      }

      toast.success('Fotoğraflar başarıyla yüklendi!');
      // Refresh gallery
      const res = await fetch(`/api/gallery/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setWedding(data);
      }
    } catch {
      toast.error('Fotoğraf yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Galeri Bulunamadı</h1>
            <p className="text-muted-foreground">Bu galeri mevcut değil veya süresi dolmuş.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-display text-xl font-bold tracking-tight">DüğünKare</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/30 py-12">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {wedding.groomName} & {wedding.brideName}
          </h1>
          <p className="text-muted-foreground mb-1">
            {new Date(wedding.weddingDate).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          {wedding.venue && (
            <p className="text-muted-foreground">{wedding.venue}</p>
          )}
        </div>
      </section>

      {/* Upload */}
      <section className="py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <Card className="border-dashed">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full sm:w-auto">
                  <label className="text-sm font-medium mb-1.5 block">Adınız (isteğe bağlı)</label>
                  <Input
                    placeholder="Fotoğrafı yükleyen..."
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    disabled={uploading}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1.5 block">Fotoğraf Yükle</label>
                  <label className="cursor-pointer">
                    <Button asChild disabled={uploading}>
                      <span>
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Fotoğraf Seç
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-8 pb-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              Fotoğraflar ({wedding.photos.length})
            </h2>
          </div>

          {wedding.photos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Henüz fotoğraf yok</h3>
                <p className="text-sm text-muted-foreground">
                  İlk fotoğrafı yükleyerek galeriyi başlatın!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wedding.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square rounded-lg overflow-hidden bg-secondary group relative"
                >
                  <img
                    src={photo.url}
                    alt={photo.fileName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {photo.uploaderName && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{photo.uploaderName}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
