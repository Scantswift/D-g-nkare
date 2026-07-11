import Link from 'next/link';
import { Heart, Shield, Clock, Trash2, AlertTriangle, Mail, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'KVKK / Gizlilik Politikası - DüğünKare',
  description: 'DüğünKare gizlilik politikası ve KVKK aydınlatma metni',
};

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-display text-xl font-bold tracking-tight">DüğünKare</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Ana Sayfa
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            KVKK / Gizlilik Politikası
          </h1>
          <p className="text-muted-foreground">Son güncelleme: Temmuz 2024</p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Collected data */}
          <section className="bg-secondary/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-semibold">Hangi Veriler Toplanıyor?</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              DüğünKare platformu üzerinden aşağıdaki veriler toplanmaktadır:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">Fotoğraf ve video:</strong> Misafirleriniz tarafından galeriye yüklenen görsel ve video içerikleri</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">İsteğe bağlı isim:</strong> Yükleme sırasında belirtilen yükleyen kişinin adı</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-foreground">İsteğe bağlı mesaj:</strong> Yüklenen fotoğraflara eklenen kısa mesajlar</span>
              </li>
            </ul>
          </section>

          {/* Section 2: Retention period */}
          <section className="bg-secondary/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-semibold">Veriler Ne Kadar Süre Saklanıyor?</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Galerileriniz, seçtiğiniz pakete bağlı olarak belirli bir süre aktif kalır:
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="bg-background rounded-lg p-4 text-center border border-border/50">
                <p className="font-display text-2xl font-bold text-primary">60</p>
                <p className="text-sm text-muted-foreground">gün - Basic</p>
              </div>
              <div className="bg-background rounded-lg p-4 text-center border border-border/50">
                <p className="font-display text-2xl font-bold text-primary">120</p>
                <p className="text-sm text-muted-foreground">gün - Premium</p>
              </div>
              <div className="bg-background rounded-lg p-4 text-center border border-border/50">
                <p className="font-display text-2xl font-bold text-primary">200</p>
                <p className="text-sm text-muted-foreground">gün - Lüks</p>
              </div>
            </div>
          </section>

          {/* Section 3: Data deletion */}
          <section className="bg-secondary/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-semibold">Süre Dolduğunda Ne Oluyor?</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Paket süresi dolduğunda, galeriye ait tüm fotoğraf, video ve ilgili veriler
              <strong className="text-foreground"> kalıcı olarak silinir</strong>. Silinen verilerin geri getirilmesi mümkün değildir.
              Süre dolmadan önce, galeri sahibi toplu indirme yaparak verilerini yedekleyebilir.
            </p>
          </section>

          {/* Section 4: Important note */}
          <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="font-display text-xl font-semibold">Önemli Not</h2>
            </div>
            <p className="text-foreground leading-relaxed">
              Galeriye yüklediğiniz fotoğraf ve videolarda yer alan diğer kişilerin (misafirler, çocuklar dahil)
              görüntülerinin paylaşılmasından, içeriği yükleyen kişi sorumludur. DüğünKare, yüklenen içeriklerin
              üçüncü kişilerin haklarını ihlal edip etmediğini kontrol etmez. Bu nedenle yüklenen içeriklerin
              paylaşım haklarının yükleyen kişiye ait olduğundan emin olunması gerekmektedir.
            </p>
          </section>

          {/* Section 5: Data subject rights */}
          <section className="bg-secondary/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-semibold">Veri Sahibinin Hakları</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              KVKK kapsamında veri sahibi olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>İşlenmişse buna ilişkin bilgi talep etme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Kişisel verilerinizin silinmesini talep etme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>İşlenen verilerin düzeltilmesini talep etme</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Bu haklarınızı kullanmak için aşağıdaki iletişim kanalları üzerinden bize ulaşabilirsiniz:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/900000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp ile ulaşın
              </a>
              <a
                href="mailto:info@dugunkare.com"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                info@dugunkare.com
              </a>
            </div>
          </section>
        </div>

        {/* Back link */}
        <div className="text-center mt-12">
          <Link href="/" className="text-sm text-primary hover:underline">
            Ana sayfaya dön
          </Link>
        </div>
      </div>

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
          </div>
          <p className="text-sm text-muted-foreground">© 2024 DüğünKare. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
