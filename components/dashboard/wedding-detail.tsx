'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QrCode, Image, Eye, Download, Calendar, MapPin, Loader2, ArrowLeft, Trash2, ExternalLink } from 'lucide-react';

interface Wedding {
  id: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venue: string;
  slug: string;
  isActive: boolean;
  photos: any[];
  _count?: { photos: number; orders: number };
}

export function WeddingDetail({ weddingId }: { weddingId: string }) {
  const router = useRouter();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [weddingUrl, setWeddingUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(true);

  useEffect(() => {
    const fetchWedding = async () => {
      try {
        const res = await fetch(`/api/weddings/${weddingId}`);
        if (res.ok) {
          const data = await res.json();
          setWedding(data);
        }
      } catch {
        setWedding(null);
      } finally {
        setLoading(false);
      }
    };

    if (weddingId) {
      fetchWedding();
    }
  }, [weddingId]);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await fetch(`/api/weddings/${weddingId}/qr`);
        if (res.ok) {
          const data = await res.json();
          setQrDataUrl(data.qrDataUrl);
          setWeddingUrl(data.weddingUrl);
        }
      } catch {
        setQrDataUrl('');
      } finally {
        setQrLoading(false);
      }
    };

    if (weddingId && wedding) {
      fetchQR();
    }
  }, [weddingId, wedding]);

  const handleDownloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `${wedding?.slug}-qr.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(weddingUrl);
    toast.success('Link kopyalandı!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </Link>
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">Düğün bulunamadı</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {wedding.groomName} & {wedding.brideName}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(wedding.weddingDate).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
            {wedding.venue && (
              <>
                <MapPin className="h-4 w-4 ml-2" />
                {wedding.venue}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Kod
            </CardTitle>
            <CardDescription>
              Misafirleriniz bu QR kodu okutarak fotoğraf yükleyebilir
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {qrLoading ? (
              <div className="aspect-square flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : qrDataUrl ? (
              <>
                <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-4" />
                <div className="space-y-2">
                  <Button onClick={handleDownloadQR} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    QR İndir
                  </Button>
                  <Button variant="outline" onClick={handleCopyLink} className="w-full">
                    Linki Kopyala
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">QR kod yüklenemedi</p>
            )}
          </CardContent>
        </Card>

        {/* Gallery Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Galeri Linki
            </CardTitle>
            <CardDescription>
              Düğün galerisine direkt erişim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={weddingUrl} readOnly className="flex-1" />
              <Button asChild>
                <a href={weddingUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              İstatistikler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Fotoğraf Sayısı</span>
              <span className="text-2xl font-bold">{wedding._count?.photos || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Durum</span>
              {wedding.isActive ? (
                <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-1 text-xs font-medium">
                  Aktif
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium">
                  Pasif
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
