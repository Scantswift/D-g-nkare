'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Heart, Camera, QrCode, Upload, Users, Image as ImageIcon,
  Send, Phone, ChevronRight, Star, CheckCircle, Instagram,
  ArrowRight, ChevronDown, Download, Palette, Video,
  Calendar, FileText, MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

const PACKAGES = [
  {
    name: 'Basic',
    features: [
      'QR Kod & Galeri Linki',
      'Sadece fotoğraf yükleme',
      '60 gün aktif galeri',
      'Beğeni sistemi (kalp ikonu)',
      'Mobil uyumlu',
    ],
    highlight: false,
  },
  {
    name: 'Premium',
    features: [
      'QR Kod & Galeri Linki',
      'Fotoğraf + video yükleme (2GB video)',
      '120 gün aktif galeri',
      'En çok beğenilen 10-15 fotoğraftan baskı',
      'Toplu galeri indirme (ZIP)',
      'Özel tasarım (çift ismi/tarih ile tema)',
      'Beğeni sistemi (kalp ikonu)',
    ],
    highlight: true,
  },
  {
    name: 'Lüks',
    features: [
      'QR Kod & Galeri Linki',
      'Fotoğraf + video yükleme (5GB video)',
      '200 gün aktif galeri',
      'En çok beğenilen fotoğraflardan kolaj/tablo baskısı',
      'Toplu galeri indirme (ZIP)',
      'Özel tasarım + öncelikli hizmet',
      'Beğeni sistemi (kalp ikonu)',
    ],
    highlight: false,
  },
];

const COMPARISON_ROWS = [
  { label: 'Medya türü', basic: 'Fotoğraf', premium: 'Fotoğraf + Video', luks: 'Fotoğraf + Video' },
  { label: 'Aktif kalma süresi', basic: '60 gün', premium: '120 gün', luks: '200 gün' },
  { label: 'Beğeni sistemi', basic: 'Var', premium: 'Var', luks: 'Var' },
  { label: 'Fiziksel baskı', basic: 'Yok', premium: '10-15 fotoğraf baskısı', luks: 'Kolaj/tablo baskısı' },
  { label: 'Toplu indirme (ZIP)', basic: 'Yok', premium: 'Var', luks: 'Var' },
  { label: 'Özel tasarım', basic: 'Yok', premium: 'Var', luks: 'Var + öncelikli' },
];

const FAQ_ITEMS = [
  {
    q: 'QR Kod nasıl çalışır?',
    a: 'Düğününüz için size özel bir QR kod ve galeri linki oluşturuyoruz. Bu QR kodu düğün mekanınıza yerleştiriyorsunuz. Misafirleriniz telefonlarıyla QR kodu okutarak galeriye anında erişiyor, çektikleri fotoğraf ve videoları doğrudan yükleyebiliyorlar.',
  },
  {
    q: 'Neden dijital fotoğraf albümü?',
    a: 'Düğününüzde misafirlerinizin telefonunda dağınık kalan, sizinle paylaşılmayan yüzlerce özel an var. Dijital galeri sayesinde bu anıların hepsi tek bir yerde, kolayca toplanır.',
  },
  {
    q: 'Paket satın aldıktan sonra süreç nasıl işliyor?',
    a: 'Bize ulaştıktan sonra size özel galeri linkiniz ve QR kodunuz oluşturulur. İsterseniz 2-3 iş günü içinde hızlıca teslim alabilir, isterseniz düğününüzden 1 hafta önce QR baskılı pleksileriniz hazırlanıp gönderilebilir.',
  },
  {
    q: 'Galeri ne kadar süre aktif kalıyor?',
    a: 'Pakete göre değişir: Basic 60 gün, Premium 120 gün, Lüks 200 gün.',
  },
  {
    q: 'Fotoğraf/video yükleme limiti var mı?',
    a: 'Evet, her paketin kendine özel bir galeri kapasitesi bulunuyor. Basic sadece fotoğraf, Premium ve Lüks fotoğraf + video destekler.',
  },
  {
    q: 'Baskı çıktıları ne zaman elime ulaşır?',
    a: 'Galeriniz aktifken, düğün sonrası belirli bir süre içinde en çok beğenilen fotoğraflarınız seçilerek bastırılır ve size gönderilir.',
  },
  {
    q: 'Ödeme nasıl yapılıyor?',
    a: 'Şu an için ödemeler havale/EFT yöntemiyle alınmaktadır.',
  },
  {
    q: 'Düğün sonrası galerimi indirebilir miyim?',
    a: 'Premium ve Lüks paketlerde toplu indirme (ZIP) özelliği bulunur, tüm fotoğraf ve videolarınızı indirebilirsiniz.',
  },
];

const DEMO_PHOTOS = [
  { url: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 142 },
  { url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 98 },
  { url: 'https://images.pexels.com/photos/1779415/pexels-photo-1779415.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 215 },
  { url: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 76 },
  { url: 'https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 189 },
  { url: 'https://images.pexels.com/photos/931796/pexels-photo-931796.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 134 },
  { url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 167 },
  { url: 'https://images.pexels.com/photos/1456613/pexels-photo-1456613.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 92 },
  { url: 'https://images.pexels.com/photos/2253842/pexels-photo-2253842.jpeg?auto=compress&cs=tinysrgb&w=600', likes: 121 },
];

const SCENARIOS = [
  {
    title: 'Örnek Çift 1',
    detail: '150 misafir, 400\'den fazla fotoğraf, düğün sonunda toplu galeri indirmesi. Misafirler QR kodu okutarak anında galeriye katkıda bulundu.',
  },
  {
    title: 'Örnek Çift 2',
    detail: '200 misafirli büyük bir düğün. Video ve fotoğraf karışık yüklendi, en çok beğenilen 15 fotoğraf seçilip bastırıldı ve çifte gönderildi.',
  },
  {
    title: 'Örnek Çift 3',
    detail: '80 misafirli samimi bir tören. Özel tasarım galeri teması ile çift isimleri ve tarihleri galeriye entegre edildi. Kolaj baskısı ile duvarda yerini aldı.',
  },
];

export function LandingPage() {
  const { data: session } = useSession() || {};
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [demoLikes, setDemoLikes] = useState<Record<number, number>>(
    DEMO_PHOTOS.map((p, i) => ({ [i]: p.likes })).reduce((a, b) => ({ ...a, ...b }), {})
  );
  const [demoLiked, setDemoLiked] = useState<Record<number, boolean>>({});

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        toast.success('Mesajınız başarıyla gönderildi!');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Mesaj gönderilemedi');
      }
    } catch {
      toast.error('Bir hata oluştu');
    } finally {
      setSending(false);
    }
  };

  const toggleDemoLike = (idx: number) => {
    if (demoLiked[idx]) {
      setDemoLikes(prev => ({ ...prev, [idx]: prev[idx] - 1 }));
      setDemoLiked(prev => ({ ...prev, [idx]: false }));
    } else {
      setDemoLikes(prev => ({ ...prev, [idx]: prev[idx] + 1 }));
      setDemoLiked(prev => ({ ...prev, [idx]: true }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-display text-xl font-bold tracking-tight">DüğünKare</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#nasil-calisir" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Nasıl Çalışır?</a>
            <a href="#demo-galeri" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Örnek Galeri</a>
            <a href="#paketler" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Paketler</a>
            <a href="#iletisim" className="text-sm text-muted-foreground hover:text-foreground transition-colors">İletişim</a>
          </nav>
          <div className="flex items-center gap-3">
            {session && (
              <Link href="/dashboard">
                <Button>Panelim <ChevronRight className="h-4 w-4 ml-1" /></Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/30" />
        <div className="max-w-[1200px] mx-auto px-4 py-24 md:py-32 relative">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-3xl mx-auto">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Camera className="h-4 w-4" />
              Düğün fotoğraf paylaşımında yeni nesil
            </motion.div>
            <motion.h1 variants={fadeInUp} className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Düğününüzde Çekilen Tüm Fotoğraflar <span className="text-primary">Tek Yerde</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              QR kod ile misafirleriniz düğün fotoğraflarını kolayca yüklesin. Tüm anılarınız dijital bir galeride toplansın.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#paketler">
                <Button size="lg" className="text-base px-8">
                  Paketleri İncele <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
              <a href="#nasil-calisir">
                <Button variant="outline" size="lg" className="text-base px-8">
                  Nasıl Çalışır?
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="nasil-calisir" className="py-20 bg-secondary/30">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Nasıl Çalışır?</motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-xl mx-auto">Sadece 3 adımda düğün fotoğraflarınızı toplayın</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-8">
            {[
              { icon: QrCode, title: 'QR Kod Oluşturun', desc: 'Düğününüz için özel QR kod ve link oluşturulur. QR kodu indirup düğün mekanına yerleştirin.', step: '1' },
              { icon: Upload, title: 'Misafirler Yüklesin', desc: 'Misafirleriniz QR kodu okutarak galeri sayfasına ulaşsın ve fotoğraflarını yüklesin.', step: '2' },
              { icon: ImageIcon, title: 'Anıları Paylaşın', desc: 'Tüm fotoğraflar dijital galerinizde toplansın. İstediğiniz zaman indirin, paylaşın.', step: '3' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-background h-full">
                  <CardContent className="p-8 text-center">
                    <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10 font-display">{item.step}</div>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Demo Gallery */}
      <section id="demo-galeri" className="py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Galeriniz Böyle Görünecek</motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-xl mx-auto">Misafirlerinizin yüklediği fotoğraflar bu şekilde görüntülenecek. Kalp ikonuna tıklayarak beğeni bırakabilirsiniz.</motion.p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DEMO_PHOTOS.map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="aspect-square rounded-xl overflow-hidden bg-secondary group relative cursor-pointer"
                onClick={() => toggleDemoLike(i)}
              >
                <img
                  src={photo.url}
                  alt="Örnek düğün fotoğrafı"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 flex items-center gap-2">
                  <Heart
                    className={`h-6 w-6 transition-all duration-200 ${demoLiked[i] ? 'text-red-500 fill-red-500 scale-110' : 'text-white fill-white/30'}`}
                  />
                  <span className="text-white text-sm font-medium">{demoLikes[i]}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Neden DüğünKare?</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: QrCode, title: 'Kolay QR Erişim', desc: 'Uygulama indirmeye gerek yok' },
              { icon: Users, title: 'Sınırsız Misafir', desc: 'Herkes yükleyebilir' },
              { icon: Camera, title: 'Yüksek Kalite', desc: 'Orijinal çözünürlük korunur' },
              { icon: Phone, title: 'Mobil Uyumlu', desc: 'Her cihazdan erişim' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="border-0 bg-background hover:bg-secondary/50 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <f.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="paketler" className="py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Paketler</motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground">Düğününüze uygun paketi seçin</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PACKAGES.map((pkg, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className={`relative overflow-hidden h-full ${pkg.highlight ? 'ring-2 ring-primary shadow-xl' : 'shadow-md'}`}>
                  {pkg.highlight && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold rounded-bl-lg">
                      <Star className="h-3 w-3 inline mr-1" />Popüler
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="font-display text-2xl font-bold mb-2">{pkg.name}</h3>
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a href="#iletisim">
                      <Button className="w-full" variant={pkg.highlight ? 'default' : 'outline'} size="lg">Bize Ulaşın</Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-16 max-w-4xl mx-auto"
          >
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-display font-semibold text-sm text-muted-foreground">Özellik</th>
                      <th className="text-center p-4 font-display font-semibold text-sm">Basic</th>
                      <th className="text-center p-4 font-display font-semibold text-sm bg-primary/5">Premium</th>
                      <th className="text-center p-4 font-display font-semibold text-sm">Lüks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map((row, i) => (
                      <tr key={i} className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-secondary/20' : ''}`}>
                        <td className="text-left p-4 text-sm font-medium">{row.label}</td>
                        <td className="text-center p-4 text-sm text-muted-foreground">{row.basic}</td>
                        <td className="text-center p-4 text-sm font-medium bg-primary/5">{row.premium}</td>
                        <td className="text-center p-4 text-sm text-muted-foreground">{row.luks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Örnek Senaryo */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Düğünkare ile Bir Düğün Böyle Geçer
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-sm text-muted-foreground max-w-xl mx-auto">
              Aşağıdaki örnek, Düğünkare deneyiminin nasıl işlediğini göstermek amacıyla hazırlanmıştır.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {SCENARIOS.map((s, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.detail}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="iletisim" className="py-20">
        <div className="max-w-[800px] mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeInUp} className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">İletişim</motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground">Sorularınız için bize ulaşın</motion.p>
          </motion.div>

          {/* WhatsApp & Instagram buttons */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 gap-4 mb-12">
            <motion.div variants={fadeInUp}>
              <a
                href="https://wa.me/900000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-[#25D366]/5 hover:bg-[#25D366]/10">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <WhatsAppIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold mb-1">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">Hemen sohbet başlatın</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <a
                href="https://instagram.com/dugunkare"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-[#E1306F]/5 hover:bg-[#E1306F]/10">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Instagram className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold mb-1">Instagram</h3>
                      <p className="text-sm text-muted-foreground">@dugunkare</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          </motion.div>

          {/* FAQ / SSS */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12">
            <motion.h3 variants={fadeInUp} className="font-display text-2xl font-bold tracking-tight mb-6 text-center">Sık Sorulan Sorular</motion.h3>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <Card className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'shadow-md ring-1 ring-primary/20' : 'shadow-sm'}`}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left p-4 flex items-center justify-between gap-4"
                    >
                      <span className="font-medium text-sm">{item.q}</span>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-60' : 'max-h-0'}`}
                    >
                      <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact form (secondary) */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Card className="border-0 shadow-sm bg-secondary/30">
              <CardContent className="p-6">
                <p className="text-center text-sm text-muted-foreground mb-4">Veya aşağıdaki formu doldurabilirsiniz</p>
                <form onSubmit={handleContact} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Ad Soyad</label>
                      <Input placeholder="Adınız" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <Input type="email" placeholder="email@örnek.com" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Konu</label>
                    <Input placeholder="Konu" value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Mesaj</label>
                    <Textarea placeholder="Mesajınız..." rows={4} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={sending}>
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-secondary/20">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-display font-bold">DüğünKare</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/kvkk" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              KVKK / Gizlilik Politikası
            </Link>
            <a href="https://instagram.com/dugunkare" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 DüğünKare. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
