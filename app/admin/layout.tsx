'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, LogOut, LayoutDashboard, Image, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AdminNav({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span className="font-display text-xl font-bold">DüğünKare</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm bg-primary/10 text-primary font-medium"
          >
            <LayoutDashboard className="h-4 w-4" />
            Galeri Yönetimi
          </Link>
        </nav>
        <div className="border-t p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const adminAuth = cookies.find(c => c.trim().startsWith('adminAuth='));
      if (adminAuth?.includes('=true')) {
        setIsAuthed(true);
      } else {
        router.push('/admin');
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleLogout = () => {
    document.cookie = 'adminAuth=; path=/; max-age=0';
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <AdminNav onLogout={handleLogout} />
      <div className="pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
