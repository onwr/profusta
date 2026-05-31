# ProfUSTA — Production deploy

## Gereksinimler

- Node.js 20+
- MySQL 8+
- Redis (önerilir — cache + rate limit)
- İyzico canlı mağaza hesabı
- Alan adı + HTTPS

## Ortam değişkenleri

`env.example` dosyasını `.env` olarak kopyalayın ve production değerlerini girin:

| Değişken | Not |
|----------|-----|
| `DATABASE_URL` | Production MySQL |
| `JWT_SECRET` | En az 32 karakter, rastgele |
| `NEXT_PUBLIC_APP_URL` | `https://alanadiniz.com` |
| `REDIS_URL` | `redis://...` |
| `PAYTR_*` | Canlı merchant; `PAYTR_TEST_MODE=0` |
| `CRON_SECRET` | Güçlü secret; harici cron için |
| `CDN_BASE_URL` | Görsel CDN kök URL (talep, ilan, mesaj) |
| `CDN_UPLOAD_URL` | `upload.php` endpoint |
| `CDN_UPLOAD_TOKEN` | CDN yükleme token (gizli tutun) |

## Veritabanı

```bash
cd web
npm install
npm run db:push
npm run db:seed   # sadece ilk kurulumda (admin kullanıcı)
```

Production için migration kullanıyorsanız: `npm run db:migrate deploy`

## Build ve çalıştırma

```bash
npm run build
npm run start
```

Port varsayılan 3000. Process manager örneği (PM2):

```bash
pm2 start npm --name profusta -- start
```

## Cron (48 saat otomatik onay)

Her saat veya günde bir:

```http
GET https://alanadiniz.com/api/cron/auto-complete-orders
Authorization: Bearer <CRON_SECRET>
```

Windows Task Scheduler veya Linux `cron` / hosting panel cron job.

## İyzico callback

İyzico panelinde bildirim URL:

`https://alanadiniz.com/api/payments/iyzico/callback`

## Nginx reverse proxy (örnek)

```nginx
server {
  listen 443 ssl;
  server_name alanadiniz.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Deploy öncesi kontrol

```bash
npm test
npm run lint
npm run build   # MySQL erişilebilir olmalı
```

## SEO

- `/sitemap.xml` — otomatik
- `/robots.txt` — admin/panel/api kapalı

## Güvenlik

- HTTPS zorunlu (oturum çerezi)
- Güvenlik başlıkları `next.config.ts` içinde
- Rate limit aktif (Redis önerilir)
