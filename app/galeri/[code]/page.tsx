'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Heart, Upload, Camera, Image as ImageIcon, Loader2, Link as LinkIcon, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Gallery {
  id: string;
  code: string;
  couple_name: string;
  wedding_date: string;
  package_type: string;
  expires_at: string;
  is_active: boolean;
}

interface Photo {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  uploader_name: string;
  created_at: string;
}

export default function GalleryPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState('');

  useEffect(() => {
    if (code) {
      fetchGallery();
    }
  }, [code]);

  const fetchGallery = async () => {
    try {
      const { data: galleryData, error: galleryError } = await supabase
        .from('galleries')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (galleryError || !galleryData) {
        setGallery(null);
        setLoading(false);
        return;
      }

      // Check if gallery is expired
      const expiresAt = new Date(galleryData.expires_at);
      const now = new Date();
      if (expiresAt < now || !galleryData.is_active) {
        setGallery({ ...galleryData, is_active: false });
        setLoading(false);
        return;
      }

      setGallery(galleryData);

      // Fetch photos
      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('gallery_id', galleryData.id)
        .order('created_at', { ascending: false });

      setPhotos(photosData || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !gallery) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${gallery.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gallery-photos')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Fotoğraf yüklenemedi');
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('gallery-photos')
          .getPublicUrl(uploadData.path);

        // Save to database
        const { error: insertError } = await supabase
          .from('photos')
          .insert({
            gallery_id: gallery.id,
            file_url: urlData.publicUrl,
            file_name: file.name,
            file_type: file.type,
            uploader_name: uploaderName || 'Anonim',
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error('Fotoğraf kaydedilemedi');
        }
      }

      toast.success('Fotoğraflar başarıyla yüklendi!');
      fetchGallery(); // Refresh photos
      e.target.value = ''; // Reset input
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
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

  if (!gallery) {
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

  if (!gallery.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Galeri Süresi Doldu</h1>
            <p className="text-muted-foreground">Bu galerinin süresi dolmuş veya devre dışı bırakılmış.</p>
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
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-display text-xl font-bold tracking-tight">DüğünKare</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/30 py-12">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {gallery.couple_name}
          </h1>
          <p className="text-muted-foreground mb-1">
            {new Date(gallery.wedding_date).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
            <LinkIcon className="h-4 w-4" />
            <code className="text-xs bg-secondary px-2 py-1 rounded">{gallery.code}</code>
          </div>
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
                  <label className="text-sm font-medium mb-1.5 block">Fotoğraf/Video Yükle</label>
                  <label className="cursor-pointer inline-block">
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
                            Dosya Seç
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  <input
                    type="file"
                    accept="image/*,video/*"
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
              Fotoğraflar ({photos.length})
            </h2>
          </div>

          {photos.length === 0 ? (
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
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square rounded-lg overflow-hidden bg-secondary group relative"
                >
                  {photo.file_type?.startsWith('video') ? (
                    <video
                      src={photo.file_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={photo.file_url}
                      alt={photo.file_name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  {photo.uploader_name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{photo.uploader_name}</p>
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
