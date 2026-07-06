'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, QrCode, Loader2, Calendar, Link as LinkIcon, Download, Copy, ExternalLink, Trash2, Clock, Package, Image } from 'lucide-react';
import QRCode from 'qrcode';

interface Gallery {
  id: string;
  code: string;
  couple_name: string;
  wedding_date: string;
  package_type: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

const PACKAGE_DURATIONS: Record<string, number> = {
  basic: 60,
  premium: 120,
  luks: 200,
};

const PACKAGE_NAMES: Record<string, string> = {
  basic: 'Basic',
  premium: 'Premium',
  luks: 'Lüks',
};

function generateGalleryCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function AdminDashboard() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newGallery, setNewGallery] = useState({
    couple_name: '',
    wedding_date: '',
    package_type: 'basic',
  });
  const [createdGallery, setCreatedGallery] = useState<{ code: string; qrDataUrl: string } | null>(null);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch('/api/admin/galleries');
      if (res.ok) {
        const data = await res.json();
        setGalleries(data);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const code = generateGalleryCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + PACKAGE_DURATIONS[newGallery.package_type]);

      const res = await fetch('/api/admin/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          couple_name: newGallery.couple_name,
          wedding_date: newGallery.wedding_date,
          package_type: newGallery.package_type,
          expires_at: expiresAt.toISOString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const galleryUrl = `${window.location.origin}/galeri/${code}`;
        const qrDataUrl = await QRCode.toDataURL(galleryUrl, {
          width: 400,
          margin: 2,
          color: { dark: '#1a1a1a', light: '#ffffff' },
        });

        setCreatedGallery({ code, qrDataUrl });
        setNewGallery({ couple_name: '', wedding_date: '', package_type: 'basic' });
        fetchGalleries();
        toast.success('Galeri başarıyla oluşturuldu!');
      } else {
        toast.error(data.error || 'Galeri oluşturulamadı');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadQR = () => {
    if (createdGallery?.qrDataUrl) {
      const link = document.createElement('a');
      link.download = `galeri-${createdGallery.code}-qr.png`;
      link.href = createdGallery.qrDataUrl;
      link.click();
    }
  };

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/galeri/${code}`);
    toast.success('Link kopyalandı!');
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Bu galeriyi silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/galleries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchGalleries();
        toast.success('Galeri silindi');
      }
    } catch (error) {
      toast.error('Silme işlemi başarısız');
    }
  };

  const getDaysRemaining = (expiresAt: string): number => {
    const now = new Date();
    const expires = new Date(expiresAt);
    return Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Galeri Yönetimi</h1>
        <p className="text-muted-foreground">Yeni galeri oluşturun ve mevcut galerileri yönetin</p>
      </div>

      {/* Create Gallery Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Yeni Galeri Oluştur
          </CardTitle>
          <CardDescription>Yeni bir düğün galerisi oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="couple_name">Çift İsmi</Label>
                <Input
                  id="couple_name"
                  placeholder="Ayşe & Mehmet"
                  value={newGallery.couple_name}
                  onChange={(e) => setNewGallery({ ...newGallery, couple_name: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="wedding_date">Düğün Tarihi</Label>
                <Input
                  id="wedding_date"
                  type="date"
                  value={newGallery.wedding_date}
                  onChange={(e) => setNewGallery({ ...newGallery, wedding_date: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="package_type">Paket Türü</Label>
                <Select
                  value={newGallery.package_type}
                  onValueChange={(value) => setNewGallery({ ...newGallery, package_type: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (60 gün)</SelectItem>
                    <SelectItem value="premium">Premium (120 gün)</SelectItem>
                    <SelectItem value="luks">Lüks (200 gün)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Galeri Oluştur
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* QR Code Result */}
      {createdGallery && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Galeri Oluşturuldu!</CardTitle>
            <CardDescription>Galeri kodu: {createdGallery.code}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <img src={createdGallery.qrDataUrl} alt="QR Code" className="w-48 h-48" />
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Misafirler şu linkten galeriye ulaşabilir:
              </p>
              <code className="block p-2 bg-secondary rounded text-sm">
                {typeof window !== 'undefined' ? window.location.origin : ''}/galeri/{createdGallery.code}
              </code>
              <div className="flex gap-2">
                <Button onClick={handleDownloadQR} variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  QR İndir
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopyLink(createdGallery.code)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Linki Kopyala
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCreatedGallery(null)}
                >
                  Kapat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Galleries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Mevcut Galeriler
          </CardTitle>
          <CardDescription>Tüm oluşturulmuş galerileri görüntüleyin</CardDescription>
        </CardHeader>
        <CardContent>
          {galleries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz galeri oluşturulmamış</p>
            </div>
          ) : (
            <div className="space-y-4">
              {galleries.map((gallery) => {
                const daysRemaining = getDaysRemaining(gallery.expires_at);
                const isExpired = daysRemaining <= 0;

                return (
                  <div
                    key={gallery.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border ${isExpired ? 'bg-gray-50 opacity-60' : 'bg-card'}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{gallery.couple_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${gallery.package_type === 'luks' ? 'bg-primary text-primary-foreground' : gallery.package_type === 'premium' ? 'bg-secondary' : 'bg-muted'}`}>
                          {PACKAGE_NAMES[gallery.package_type] || gallery.package_type}
                        </span>
                        {isExpired && (
                          <span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive">
                            Süresi Doldu
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(gallery.wedding_date).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {isExpired ? 'Süresi doldu' : `${daysRemaining} gün kaldı`}
                        </span>
                        <code className="text-xs bg-secondary px-1 rounded">{gallery.code}</code>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(gallery.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={`/galeri/${gallery.code}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteGallery(gallery.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
