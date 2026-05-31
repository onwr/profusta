# ProfUSTA Web

Next.js (App Router) + Tailwind CSS + Prisma + MySQL

## Kurulum

```bash
cd web
npm install
copy env.example .env   # Windows
# .env içinde DATABASE_URL ve JWT_SECRET düzenleyin
npm run db:push         # MySQL çalışıyorsa şemayı uygular
npm run db:seed         # Admin kullanıcı oluşturur
npm run dev
```

## Auth (Faz 1)

| Sayfa | URL |
|-------|-----|
| Giriş | `/giris` |
| Müşteri kayıt | `/kayit` |
| Usta başvuru | `/usta-basvuru` |
| Admin panel | `/admin` |

Varsayılan admin (`db:seed`): `admin@profusta.com` / `Admin1234!`

> **Not:** Prisma 7, MySQL için `@prisma/adapter-mariadb` kullanır. `DATABASE_URL` formatı: `mysql://kullanici:sifre@localhost:3306/profusta`

Uygulama: [http://localhost:3000](http://localhost:3000)  
Sağlık kontrolü: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Klasör yapısı

```
src/
  app/           # Sayfalar ve API route'ları
  components/    # UI ve layout bileşenleri
  lib/           # db, env, redis, yardımcılar
  generated/     # Prisma client (otomatik)
prisma/          # Şema ve migration'lar
```

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run db:migrate` | Migration oluştur ve uygula |
| `npm run db:studio` | Prisma Studio |

## Gereksinimler

- Node.js 20+
- MySQL 8+
- Redis (opsiyonel)
