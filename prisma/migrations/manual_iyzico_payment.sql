-- İyzico geçişi: payments tablosu (manuel çalıştırın — db push başarısız olursa)
-- MySQL 8+

ALTER TABLE payments DROP INDEX IF EXISTS payments_order_id_key;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS checkout_token VARCHAR(512) NULL AFTER total_amount_kurus,
  ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(255) NULL AFTER checkout_token;

ALTER TABLE payments DROP COLUMN IF EXISTS paytr_hash;

-- Mevcut merchant_oid tekrarları varsa önce düzeltin, sonra:
-- ALTER TABLE payments ADD UNIQUE INDEX payments_merchant_oid_key (merchant_oid);
