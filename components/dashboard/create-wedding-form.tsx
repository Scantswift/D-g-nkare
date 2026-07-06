'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function CreateWeddingForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    groomName: '',
    brideName: '',
    weddingDate: '',
    venue: '',
    packageType: 'basic',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Düğün başarıyla oluşturuldu!');
        router.push(`/dashboard/dugun/${data.id}`);
      } else {
        toast.error(data.error || 'Düğün oluşturulurken hata');
      }
    } catch {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Yeni Düğün Oluştur</h1>
          <p className="text-muted-foreground">Düğününüz için galeri ve QR kod oluşturun</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Damat Adı</label>
                <Input
                  placeholder="Damat adı"
                  value={form.groomName}
                  onChange={(e) => setForm({ ...form, groomName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Gelin Adı</label>
                <Input
                  placeholder="Gelin adı"
                  value={form.brideName}
                  onChange={(e) => setForm({ ...form, brideName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Düğün Tarihi</label>
              <Input
                type="date"
                value={form.weddingDate}
                onChange={(e) => setForm({ ...form, weddingDate: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Mekan (İsteğe Bağlı)</label>
              <Input
                placeholder="Düğün mekanı"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Paket</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'basic', label: 'Basic', desc: '500 fotoğraf, 30 gün' },
                  { value: 'premium', label: 'Premium', desc: 'Sınırsız, 90 gün' },
                ].map((pkg) => (
                  <div
                    key={pkg.value}
                    onClick={() => setForm({ ...form, packageType: pkg.value })}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      form.packageType === pkg.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">{pkg.label}</p>
                    <p className="text-sm text-muted-foreground">{pkg.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Calendar className="h-4 w-4 mr-2" />
              Düğünü Oluştur
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
