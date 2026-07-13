'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Heart, Upload, Camera, Image as ImageIcon, Loader2, Video, Mic, MicOff, Play, Pause, Square, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Photo {
  id: string;
  url: string;
  fileName: string;
  uploaderName: string;
  createdAt: string;
  contentType?: string;
  likes?: number;
  isAudio?: boolean;
  audioUrl?: string;
  // optimistic-only
  _optimistic?: boolean;
  _uploading?: boolean;
}

interface Wedding {
  id: string;
  coupleName: string;
  weddingDate: string;
  code: string;
  packageType: string;
  theme: string;
  expiresAt: string;
  photos: Photo[];
}

// ─── Theme definitions ───────────────────────────────────────────────────────

const THEMES: Record<string, { bg: string; header: string; accent: string; badge: string; text: string; subtext: string }> = {
  'classic-cream': {
    bg: 'bg-[#fdf8f0]',
    header: 'bg-[#fdf8f0]/90',
    accent: 'text-[#b5704a]',
    badge: 'bg-[#b5704a] text-white',
    text: 'text-[#3d2b1f]',
    subtext: 'text-[#8a6a56]',
  },
  'pastel-pink': {
    bg: 'bg-[#fff5f7]',
    header: 'bg-[#fff5f7]/90',
    accent: 'text-[#d4608a]',
    badge: 'bg-[#d4608a] text-white',
    text: 'text-[#3d1a2a]',
    subtext: 'text-[#8a5068]',
  },
  'burgundy-gold': {
    bg: 'bg-[#f9f4ee]',
    header: 'bg-[#f9f4ee]/90',
    accent: 'text-[#a8892a]',
    badge: 'bg-[#7c1d35] text-white',
    text: 'text-[#2a1020]',
    subtext: 'text-[#7c4d5a]',
  },
  'minimal-white': {
    bg: 'bg-white',
    header: 'bg-white/90',
    accent: 'text-neutral-700',
    badge: 'bg-neutral-800 text-white',
    text: 'text-neutral-900',
    subtext: 'text-neutral-500',
  },
};

// ─── TiltCard ─────────────────────────────────────────────────────────────────

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const [style, setStyle] = useState({});
  const enter = () =>
    setStyle({ transform: 'scale(1.03) rotateX(2deg) rotateY(-2deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', transition: 'all 0.25s ease' });
  const leave = () =>
    setStyle({ transform: 'scale(1) rotateX(0deg) rotateY(0deg)', boxShadow: '', transition: 'all 0.25s ease' });

  return (
    <div
      className={className}
      style={style}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onTouchStart={enter}
      onTouchEnd={leave}
    >
      {children}
    </div>
  );
}

// ─── AudioRecorder ─────────────────────────────────────────────────────────────

function AudioRecorder({
  onRecordingComplete,
  disabled,
}: {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_SECONDS = 15;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stopRecording();
          return s + 1;
        });
      }, 1000);
    } catch {
      toast.error('Mikrofon erişimi sağlanamadı');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    setSeconds(0);
  };

  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
        >
          <Square className="h-4 w-4" />
          Durdur ({MAX_SECONDS - seconds}s)
        </button>
      ) : (
        <button
          onClick={startRecording}
          disabled={disabled}
          className="flex items-center gap-2 border border-border hover:bg-secondary rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Mic className="h-4 w-4 text-primary" />
          Ses Notu Kaydet
        </button>
      )}
    </div>
  );
}

// ─── AudioPlayer ──────────────────────────────────────────────────────────────

function AudioPlayer({ url, uploaderName }: { url: string; uploaderName: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <Card className="border border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/80 transition-colors"
        >
          {playing ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">Ses Notu</p>
          {uploaderName && <p className="text-xs text-muted-foreground truncate">{uploaderName}</p>}
        </div>
        <Mic className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GalleryPage({ slug }: { slug: string }) {
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploaderName, setUploaderName] = useState('');
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = THEMES[wedding?.theme ?? 'classic-cream'] ?? THEMES['classic-cream'];

  useEffect(() => {
    if (!slug) return;
    const fetchWedding = async () => {
      try {
        const res = await fetch(`/api/gallery/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setWedding(data);
          setPhotos(data.photos || []);
          const initialLikes: Record<string, number> = {};
          (data.photos || []).forEach((p: Photo) => { initialLikes[p.id] = p.likes || 0; });
          setLikes(initialLikes);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWedding();
  }, [slug]);

  const uploadFile = useCallback(async (file: File, tempId: string) => {
    try {
      // 1. Get presigned URL
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      });
      if (!presignRes.ok) throw new Error('Upload URL alınamadı');
      const { uploadUrl, publicUrl } = await presignRes.json();

      // 2. Upload file
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });

      // 3. Content moderation + record
      const recordRes = await fetch(`/api/gallery/${slug}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: publicUrl || uploadUrl.split('?')[0],
          fileName: file.name,
          fileType: file.type,
          uploaderName,
          isAudio: false,
        }),
      });

      const recordData = await recordRes.json();

      if (!recordRes.ok) {
        // Remove optimistic entry
        setPhotos((prev) => prev.filter((p) => p.id !== tempId));
        if (recordData.blocked) {
          toast.error(recordData.error || 'Uygunsuz içerik tespit edildi.');
        } else {
          toast.error('Fotoğraf kaydedilemedi.');
        }
        return;
      }

      // Replace optimistic entry with real data
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? {
                id: recordData.id,
                url: recordData.file_url,
                fileName: recordData.file_name || file.name,
                uploaderName: recordData.uploader_name || uploaderName,
                createdAt: recordData.created_at,
                contentType: recordData.file_type,
                likes: 0,
                isAudio: false,
              }
            : p,
        ),
      );
      setLikes((prev) => {
        const next = { ...prev };
        next[recordData.id] = 0;
        delete next[tempId];
        return next;
      });
    } catch {
      setPhotos((prev) => prev.filter((p) => p.id !== tempId));
      toast.error('Yükleme sırasında bir hata oluştu.');
    }
  }, [slug, uploaderName]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !wedding) return;
    e.target.value = '';

    for (const file of Array.from(files)) {
      const tempId = `optimistic-${Date.now()}-${Math.random()}`;
      const localUrl = URL.createObjectURL(file);

      // Add optimistic entry immediately
      setPhotos((prev) => [
        {
          id: tempId,
          url: localUrl,
          fileName: file.name,
          uploaderName,
          createdAt: new Date().toISOString(),
          contentType: file.type,
          likes: 0,
          _optimistic: true,
          _uploading: true,
        },
        ...prev,
      ]);
      setLikes((prev) => ({ ...prev, [tempId]: 0 }));

      // Upload in background (non-blocking)
      uploadFile(file, tempId);
    }

    toast.success('Fotoğraflar yükleniyor...');
  };

  const handleAudioUpload = async (blob: Blob) => {
    if (!wedding) return;
    const tempId = `audio-opt-${Date.now()}`;
    const localUrl = URL.createObjectURL(blob);

    setPhotos((prev) => [
      {
        id: tempId,
        url: localUrl,
        fileName: 'ses-notu.webm',
        uploaderName,
        createdAt: new Date().toISOString(),
        contentType: 'audio/webm',
        likes: 0,
        isAudio: true,
        audioUrl: localUrl,
        _optimistic: true,
        _uploading: true,
      },
      ...prev,
    ]);

    try {
      const presignRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: `ses-notu-${Date.now()}.webm`, contentType: 'audio/webm', isPublic: true }),
      });
      if (!presignRes.ok) throw new Error();
      const { uploadUrl, publicUrl } = await presignRes.json();

      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'audio/webm' }, body: blob });

      const audioFileUrl = publicUrl || uploadUrl.split('?')[0];

      const recordRes = await fetch(`/api/gallery/${slug}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: audioFileUrl,
          fileName: 'ses-notu.webm',
          fileType: 'audio/webm',
          uploaderName,
          audioUrl: audioFileUrl,
          isAudio: true,
        }),
      });

      const recordData = await recordRes.json();
      if (!recordRes.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== tempId));
        toast.error('Ses notu kaydedilemedi.');
        return;
      }

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? {
                id: recordData.id,
                url: recordData.file_url,
                fileName: 'ses-notu.webm',
                uploaderName: recordData.uploader_name || uploaderName,
                createdAt: recordData.created_at,
                contentType: 'audio/webm',
                likes: 0,
                isAudio: true,
                audioUrl: recordData.audio_url || audioFileUrl,
              }
            : p,
        ),
      );
      toast.success('Ses notu paylaşıldı!');
    } catch {
      setPhotos((prev) => prev.filter((p) => p.id !== tempId));
      toast.error('Ses notu yüklenemedi.');
    }
  };

  const handleLike = async (photoId: string) => {
    if (likedPhotos[photoId]) return;
    setLikes((prev) => ({ ...prev, [photoId]: (prev[photoId] || 0) + 1 }));
    setLikedPhotos((prev) => ({ ...prev, [photoId]: true }));
    try {
      await fetch(`/api/gallery/${slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      });
    } catch {
      setLikes((prev) => ({ ...prev, [photoId]: (prev[photoId] || 0) - 1 }));
      setLikedPhotos((prev) => ({ ...prev, [photoId]: false }));
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

  // Altın Kareler — top liked (non-audio, non-optimistic)
  const realPhotos = photos.filter((p) => !p.isAudio && !p._optimistic);
  const goldenPhotos = [...realPhotos]
    .sort((a, b) => (likes[b.id] || b.likes || 0) - (likes[a.id] || a.likes || 0))
    .slice(0, 12)
    .filter((p) => (likes[p.id] || p.likes || 0) > 0);

  const audioNotes = photos.filter((p) => p.isAudio);
  const regularPhotos = photos.filter((p) => !p.isAudio);

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${theme.header} backdrop-blur-md border-b border-border/50`}>
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className={`h-6 w-6 fill-current ${theme.accent}`} />
            <span className={`font-display text-xl font-bold tracking-tight ${theme.text}`}>DüğünKare</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className={`font-display text-3xl md:text-4xl font-bold tracking-tight mb-2 ${theme.text}`}>
            {wedding.coupleName}
          </h1>
          <p className={`mb-1 ${theme.subtext}`}>
            {new Date(wedding.weddingDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mt-2 ${theme.badge}`}>
            {wedding.packageType === 'luks' ? 'Lüks' : wedding.packageType === 'premium' ? 'Premium' : 'Basic'}
          </span>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <Card className="border-dashed border-2">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-sm font-medium mb-1.5 block">Adınız (isteğe bağlı)</label>
                  <Input
                    placeholder="Fotoğrafı yükleyen..."
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2 flex-wrap">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Fotoğraf / Video</label>
                    <Button onClick={() => fileInputRef.current?.click()} variant="default">
                      <Upload className="h-4 w-4 mr-2" />
                      Dosya Seç
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Ses Notu</label>
                    <AudioRecorder onRecordingComplete={handleAudioUpload} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Audio Notes */}
      {audioNotes.length > 0 && (
        <section className="py-4">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Mic className={`h-5 w-5 ${theme.accent}`} />
              <h2 className={`text-lg font-semibold ${theme.text}`}>Ses Notları ({audioNotes.length})</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {audioNotes.map((note) => (
                <div key={note.id} className={note._uploading ? 'opacity-60' : ''}>
                  {note._uploading ? (
                    <Card className="border border-border/60">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Yükleniyor...</span>
                      </CardContent>
                    </Card>
                  ) : (
                    <AudioPlayer url={note.audioUrl || note.url} uploaderName={note.uploaderName} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Altın Kareler */}
      {goldenPhotos.length >= 3 && (
        <section className="py-6">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className={`text-xl font-semibold ${theme.text}`}>Altın Kareler</h2>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">En Çok Beğenilen</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {goldenPhotos.map((photo, idx) => (
                <TiltCard key={photo.id}>
                  <div className="aspect-square rounded-xl overflow-hidden bg-secondary relative group cursor-pointer" onClick={() => handleLike(photo.id)}>
                    <img src={photo.url} alt={photo.fileName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    {/* Gold badge */}
                    <div className="absolute top-2 left-2">
                      <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold shadow ${idx === 0 ? 'bg-amber-400 text-amber-900' : idx === 1 ? 'bg-slate-300 text-slate-700' : 'bg-orange-300 text-orange-900'}`}>
                        <Star className="h-3 w-3" />
                        {idx + 1}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex items-end justify-between">
                      <span className="text-white text-xs truncate">{photo.uploaderName}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleLike(photo.id); }} className="flex items-center gap-1">
                        <Heart className={`h-5 w-5 ${likedPhotos[photo.id] ? 'text-red-400 fill-red-400' : 'text-white fill-white/30'}`} />
                        <span className="text-white text-xs font-medium">{likes[photo.id] ?? photo.likes ?? 0}</span>
                      </button>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Gallery */}
      <section className="py-6 pb-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className={`h-5 w-5 ${theme.accent}`} />
            <h2 className={`text-xl font-semibold ${theme.text}`}>
              Tüm Fotoğraflar ({regularPhotos.length})
            </h2>
          </div>

          {regularPhotos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Henüz fotoğraf yok</h3>
                <p className="text-sm text-muted-foreground">İlk fotoğrafı yükleyerek galeriyi başlatın!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {regularPhotos.map((photo) => {
                const isVideo = photo.contentType?.startsWith('video/');
                const isOptimistic = photo._optimistic;
                return (
                  <TiltCard key={photo.id}>
                    <div className={`aspect-square rounded-lg overflow-hidden bg-secondary group relative ${isOptimistic ? 'ring-2 ring-primary/30' : ''}`}>
                      {isOptimistic && photo._uploading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-lg">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                      {isVideo ? (
                        <video src={photo.url} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={photo.url} alt={photo.fileName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 flex items-end justify-between">
                        <span className="text-white text-xs truncate max-w-[60%]">{photo.uploaderName}</span>
                        {!isOptimistic && (
                          <button
                            onClick={() => handleLike(photo.id)}
                            className="flex items-center gap-1 hover:scale-110 transition-transform"
                          >
                            <Heart className={`h-5 w-5 transition-all ${likedPhotos[photo.id] ? 'text-red-400 fill-red-400 scale-110' : 'text-white fill-white/30'}`} />
                            <span className="text-white text-xs font-medium">{likes[photo.id] ?? photo.likes ?? 0}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
