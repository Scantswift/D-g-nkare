'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus, Loader2, Calendar, Download, Copy, ExternalLink,
  Trash2, Clock, Image, QrCode, BarChart2, Users, Camera,
  Palette, X,
} from 'lucide-react';
import QRCode from 'qrcode';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gallery {
  id: string;
  code: string;
  couple_name: string;
  wedding_date: string;
  package_type: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  scan_count: number;
  theme: string;
  photos?: { count: number }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PACKAGE_DURATIONS: Record<string, number> = { basic: 60, premium: 120, luks: 200 };
const PACKAGE_NAMES: Record<string, string> = { basic: 'Basic', premium: 'Premium', luks: 'Lüks' };

const THEMES = [
  { value: 'classic-cream', label: 'Klasik Krem', swatch: '#fdf8f0', text: '#b5704a' },
  { value: 'pastel-pink',   label: 'Pastel Pembe', swatch: '#fff5f7', text: '#d4608a' },
  { value: 'burgundy-gold', label: 'Bordo Altın',  swatch: '#7c1d35', text: '#a8892a' },
  { value: 'minimal-white', label: 'Minimalist Beyaz', swatch: '#ffffff', text: '#374151' },
];

const THEME_ENABLED_PACKAGES = ['premium', 'luks'];

function generateGalleryCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── Stats Modal ──────────────────────────────────────────────────────────────

function StatsModal({ gallery, onClose }: { gallery: Gallery; onClose: () => void }) {
  const photoCount = gallery.photos?.[0]?.count ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">İstatistikler</CardTitle>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-secondary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary card */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Düğün Özeti</p>
            <h2 className="font-display text-xl font-bold mb-3">{gallery.couple_name}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Düğününüze <strong>{gallery.scan_count || 0}</strong> misafir QR kodu okuttu
              ve <strong>{photoCount}</strong> fotoğraf paylaşıldı.{' '}
              {photoCount > 50 ? 'Harika bir anı koleksiyonu oluştu!' : 'Galeriye katkılar devam ediyor!'}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <QrCode className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold font-display">{gallery.scan_count || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">QR Tarama</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <Camera className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold font-display">{photoCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Fotoğraf</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4 text-center col-span-2">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">
                {new Date(gallery.wedding_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Düğün Tarihi</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newGallery, setNewGallery] = useState({
    couple_name: '',
    wedding_date: '',
    package_type: 'basic',
    theme: 'classic-cream',
  });
  const [createdGallery, setCreatedGallery] = useState<{ code: string; qrDataUrl: string } | null>(null);
  const [statsGallery, setStatsGallery] = useState<Gallery | null>(null);

  useEffect(() => { fetchGalleries(); }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch('/api/admin/galleries');
      if (res.ok) setGalleries(await res.json());
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
          theme: THEME_ENABLED_PACKAGES.includes(newGallery.package_type) ? newGallery.theme : 'classic-cream',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const galleryUrl = `${window.location.origin}/galeri/${code}`;
        const qrDataUrl = await QRCode.toDataURL(galleryUrl, { width: 400, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } });
        setCreatedGallery({ code, qrDataUrl });
        setNewGallery({ couple_name: '', wedding_date: '', package_type: 'basic', theme: 'classic-cream' });
        fetchGalleries();
        toast.success('Galeri başarıyla oluşturuldu!');
      } else {
        toast.error(data.error || 'Galeri oluşturulamadı');
      }
    } catch {
      toast.error('Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Bu galeriyi silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/admin/galleries/${id}`, { method: 'DELETE' });
    if (res.ok) { fetchGalleries(); toast.success('Galeri silindi'); }
    else toast.error('Silme işlemi başarısız');
  };

  const getDaysRemaining = (expiresAt: string) =>
    Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const themeEnabled = THEME_ENABLED_PACKAGES.includes(newGallery.package_type);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Galeri Yönetimi</h1>
        <p className="text-muted-foreground">Yeni galeri oluşturun ve mevcut galerileri yönetin</p>
      </div>

      {/* Create Form */}
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
                <Input id="couple_name" placeholder="Ayşe & Mehmet"
                  value={newGallery.couple_name}
                  onChange={(e) => setNewGallery({ ...newGallery, couple_name: e.target.value })}
                  required disabled={submitting} />
              </div>
              <div>
                <Label htmlFor="wedding_date">Düğün Tarihi</Label>
                <Input id="wedding_date" type="date"
                  value={newGallery.wedding_date}
                  onChange={(e) => setNewGallery({ ...newGallery, wedding_date: e.target.value })}
                  required disabled={submitting} />
              </div>
              <div>
                <Label htmlFor="package_type">Paket Türü</Label>
                <Select value={newGallery.package_type}
                  onValueChange={(v) => setNewGallery({ ...newGallery, package_type: v })}
                  disabled={submitting}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (60 gün)</SelectItem>
                    <SelectItem value="premium">Premium (120 gün)</SelectItem>
                    <SelectItem value="luks">Lüks (200 gün)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Theme selector — only for premium/luks */}
            <div className={themeEnabled ? '' : 'opacity-40 pointer-events-none'}>
              <Label className="flex items-center gap-1 mb-2">
                <Palette className="h-4 w-4" />
                Galeri Teması
                {!themeEnabled && <span className="text-xs text-muted-foreground ml-1">(Premium / Lüks paketlerde aktif)</span>}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setNewGallery({ ...newGallery, theme: t.value })}
                    className={`flex items-center gap-2 p-2 rounded-lg border-2 text-sm transition-all ${newGallery.theme === t.value ? 'border-primary shadow-sm' : 'border-transparent'}`}
                    style={{ background: t.swatch }}
                    disabled={submitting}
                  >
                    <span className="w-4 h-4 rounded-full border border-border flex-shrink-0" style={{ background: t.text }} />
                    <span className="font-medium truncate text-xs" style={{ color: t.text }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Oluşturuluyor...</> : <><Plus className="h-4 w-4 mr-2" />Galeri Oluştur</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Created Gallery Result */}
      {createdGallery && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Galeri Oluşturuldu!</CardTitle>
            <CardDescription>Galeri kodu: {createdGallery.code}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <img src={createdGallery.qrDataUrl} alt="QR Code" className="w-48 h-48" />
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Misafirler şu linkten galeriye ulaşabilir:</p>
              <code className="block p-2 bg-secondary rounded text-sm">
                {typeof window !== 'undefined' ? window.location.origin : ''}/galeri/{createdGallery.code}
              </code>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => {
                  const link = document.createElement('a');
                  link.download = `galeri-${createdGallery.code}-qr.png`;
                  link.href = createdGallery.qrDataUrl;
                  link.click();
                }}>
                  <Download className="h-4 w-4 mr-2" />QR İndir
                </Button>
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/galeri/${createdGallery.code}`);
                  toast.success('Link kopyalandı!');
                }}>
                  <Copy className="h-4 w-4 mr-2" />Linki Kopyala
                </Button>
                <Button variant="ghost" onClick={() => setCreatedGallery(null)}>Kapat</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Mevcut Galeriler
          </CardTitle>
          <CardDescription>Tüm oluşturulmuş galeriler</CardDescription>
        </CardHeader>
        <CardContent>
          {galleries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz galeri oluşturulmamış</p>
            </div>
          ) : (
            <div className="space-y-3">
              {galleries.map((gallery) => {
                const daysRemaining = getDaysRemaining(gallery.expires_at);
                const isExpired = daysRemaining <= 0;
                const photoCount = gallery.photos?.[0]?.count ?? 0;

                return (
                  <div key={gallery.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${isExpired ? 'opacity-60 bg-secondary/20' : 'bg-card hover:shadow-sm'}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{gallery.couple_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${gallery.package_type === 'luks' ? 'bg-primary text-primary-foreground' : gallery.package_type === 'premium' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {PACKAGE_NAMES[gallery.package_type] || gallery.package_type}
                        </span>
                        {isExpired && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Süresi Doldu</span>}
                      </div>
                      {/* Stats bar */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(gallery.wedding_date).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {isExpired ? 'Süresi doldu' : `${daysRemaining} gün kaldı`}
                        </span>
                        <span className="flex items-center gap-1">
                          <QrCode className="h-3 w-3" />
                          {gallery.scan_count || 0} tarama
                        </span>
                        <span className="flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          {photoCount} fotoğraf
                        </span>
                        <code className="bg-secondary px-1.5 py-0.5 rounded">{gallery.code}</code>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Button variant="ghost" size="sm" onClick={() => setStatsGallery(gallery)} title="İstatistikler">
                        <BarChart2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/galeri/${gallery.code}`);
                        toast.success('Link kopyalandı!');
                      }} title="Linki Kopyala">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/galeri/${gallery.code}`} target="_blank" rel="noopener noreferrer" title="Galeriyi Aç">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteGallery(gallery.id)} title="Sil">
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

      {/* Stats Modal */}
      {statsGallery && <StatsModal gallery={statsGallery} onClose={() => setStatsGallery(null)} />}
    </div>
  );
}
