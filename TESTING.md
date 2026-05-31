# ProfUSTA — Test rehberi

## Otomatik testler (Vitest)

```bash
cd web
npm test
```

Kapsam:

| Dosya | Konu |
|-------|------|
| `haversine.test.ts` | Mesafe hesabı |
| `turkey.test.ts` | İl/ilçe verisi |
| `safety.test.ts` | Mesaj engelleme (telefon, IBAN, sosyal medya) |
| `iyzico.test.ts` | İyzico fiyat/telefon yardımcıları |
| `google-state.test.ts` | Google OAuth state imzası |
| `google-user.test.ts` | Google kullanıcı çözümleme |
| `redirect.test.ts` | Rol yönlendirmeleri |
| `commission.test.ts` | Komisyon hesabı |

## Manuel E2E kontrol listesi (sizin yaptığınız testler)

- [ ] Müşteri kayıt / giriş / çıkış
- [ ] Talep oluştur + harita + il/ilçe
- [ ] Usta teklif ver → müşteri kabul → İyzico sandbox ödeme
- [ ] Usta iş kabul / başlat / tamamla → müşteri onay
- [ ] Mesaj: telefon/IBAN içeren metin engellenmeli
- [ ] İlan satın alma / özel teklif akışı
- [ ] İptal (PAID_ESCROW) ve itiraz (tamamlanan iş)
- [ ] Admin: iade, itiraz, yorum moderasyonu
- [ ] Mobil: müşteri/usta paneli, talep formu, ilan listesi

## Google OAuth

1. `.env` içinde `NEXT_PUBLIC_APP_URL` doğru domain olmalı (redirect URI buna göre hesaplanır)
2. Admin panel → **Google Giriş** (`/admin/google-giris`) — adım adım kurulum rehberi ve kopyalanacak URI’ler burada
3. [Google Cloud Console](https://console.cloud.google.com/) → OAuth Client ID (Web) oluşturup Client ID / Secret’ı admin forma kaydedin
4. OAuth consent **Test** modunda: Test users listesine giriş yapacak Gmail hesaplarını ekleyin

Manuel kontrol:

- [ ] `/giris` → Google ile Devam Et → mevcut hesap girişi
- [ ] `/kayit` → Google ile Devam Et → yeni müşteri oluşturma
- [ ] Aynı e-posta ile önce şifreli kayıt, sonra Google → hesap bağlanır
- [ ] Google-only hesap → e-posta/şifre girişi reddedilir

## İyzico sandbox

1. Admin panel → **Finans → İyzico Ayarları** (`/admin/iyzico-ayarlari`): sandbox API anahtarı, secret, callback URL
2. Test kartları: İyzico dokümantasyonundaki sandbox kartları (ör. `5528790000000008`)
3. Callback URL herkese açık olmalı — `localhost` çalışmaz (tarayıcı Private Network Access + İyzico sunucu bildirimi)

### Nerede test edilir?

| Yöntem | Açıklama |
|--------|----------|
| **Ubuntu VPS (staging)** | Uygulamayı VPS’e deploy edin, `staging.alanadiniz.com` + Let’s Encrypt HTTPS. `NEXT_PUBLIC_APP_URL` ve admin paneldeki callback URL bu domain. En stabil yol; ngrok gerekmez. |
| **cloudflared** | `cloudflared tunnel --url http://localhost:3000` — ngrok alternatifi, ücretsiz. |
| **localtunnel** | `npx localtunnel --port 3000` — benzer tünel. |

VPS’te `.env` + admin panel örneği:

```env
NEXT_PUBLIC_APP_URL="https://staging.profusta.com"
```

Admin → İyzico Ayarları → callback URL:

`https://staging.profusta.com/api/payments/iyzico/callback`

İyzico panelinde de aynı callback URL tanımlı olmalı.

## Rate limit (geliştirme)

- Giriş: 20 istek / dakika / IP
- Kayıt: 10 istek / saat / IP
- Mesaj: 60 istek / dakika / kullanıcı
- Redis yoksa bellek içi sayaç (tek sunucu)

429 yanıtı: `Çok fazla istek...`
