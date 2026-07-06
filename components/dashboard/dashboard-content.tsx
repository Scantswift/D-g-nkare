'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Image, Eye, Plus, QrCode, Download } from 'lucide-react';

interface Wedding {
  id: string;
  groomName: string;
  brideName: string;
  weddingDate: string;
  venue: string;
  slug: string;
  isActive: boolean;
  _count?: { photos: number; orders: number };
}

export function DashboardContent() {
  const { data: session } = useSession();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeddings = async () => {
      try {
        const res = await fetch('/api/weddings');
        if (res.ok) {
          const data = await res.json();
          setWeddings(data);
        }
      } catch (error) {
        console.error('Error fetching weddings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchWeddings();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Toplam Düğün', value: weddings.length, icon: Calendar, color: 'text-primary' },
    { label: 'Toplam Fotoğraf', value: weddings.reduce((sum, w) => sum + (w._count?.photos || 0), 0), icon: Image, color: 'text-blue-500' },
    { label: 'Toplam Görüntüleme', value: weddings.reduce((sum, w) => sum + 0, 0), icon: Eye, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weddings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Düğünlerim</h2>
          <Link href="/dashboard/yeni">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Düğün
            </Button>
          </Link>
        </div>

        {weddings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="mb-2">Henüz düğün yok</CardTitle>
              <CardDescription className="mb-4 max-w-sm">
                İlk düğünüzü oluşturarak QR kodunuzu alın ve misafirlerinizin fotoğraf yüklemesine izin verin.
              </CardDescription>
              <Link href="/dashboard/yeni">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Düğün Oluştur
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {weddings.map((wedding) => (
              <Card key={wedding.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {wedding.groomName} & {wedding.brideName}
                      </CardTitle>
                      <CardDescription>
                        {new Date(wedding.weddingDate).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </CardDescription>
                    </div>
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
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Image className="h-4 w-4" />
                      {wedding._count?.photos || 0} fotoğraf
                    </span>
                    {wedding.venue && (
                      <span>{wedding.venue}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/dugun/${wedding.id}`}>
                      <Button size="sm" variant="outline">
                        <QrCode className="h-4 w-4 mr-2" />
                        QR Kod
                      </Button>
                    </Link>
                    <Link href={`/dugun/${wedding.slug}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4 mr-2" />
                        Galeriyi Gör
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
