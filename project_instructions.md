# DüğünKare - Düğün Fotoğraf Paylaşım Platformu

## Proje Özeti
QR kod tabanlı düğün fotoğraf paylaşım platformu. Organizatörler düğün oluşturur, QR kod alır, misafirler QR ile fotoğraf yükler.

## Teknik Yapı
- Database: PostgreSQL + Prisma ORM
- Auth: NextAuth v4 (JWT, role-based: ADMIN/ORGANIZER)
- Storage: S3 cloud storage (presigned URL upload)
- QR: qrcode kütüphanesi
- UI: Tailwind CSS + Framer Motion + Radix UI

## Renk Paleti
- Primary: Rose/pink (HSL 350 60% 55%) - düğün teması
- Light mode odaklı tasarım

## Sayfa Yapısı
- `/` - Public landing page (Türkçe)
- `/giris` - Organizatör giriş
- `/kayit` - Organizatör kayıt  
- `/dashboard` - Organizatör paneli
- `/dashboard/yeni` - Yeni düğün oluştur
- `/dashboard/dugun/[id]` - Düğün detay + QR kod
- `/dugun/[slug]` - Misafir galeri (public, auth gerektirmez)
- `/admin` - Admin dashboard
- `/admin/siparisler` - Sipariş yönetimi
- `/admin/ayarlar` - Platform ayarları (IBAN, WhatsApp, fiyatlar)

## Kullanıcı Tercihleri
- Tüm UI Türkçe
- Misafir tarafı: sadece galeri görme + foto/video yükleme
- Sipariş için WhatsApp iletişim (form değil)
- IBAN ile manuel ödeme
- WhatsApp entegrasyonu sonraya kalacak
- Instagram sosyal medya bağlantısı var

## Veritabanı Tabloları
- User (organizatör + admin, role enum)
- Wedding (düğün bilgileri, slug, QR)
- Photo (cloud storage path, uploader name)
- Order (baskı/tablo siparişleri)
- Setting (IBAN, fiyatlar, WhatsApp no)
- ContactMessage (iletişim formu)
