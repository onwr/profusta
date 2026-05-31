"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IyzicoCheckout } from "@/components/payments/iyzico-checkout";
import { ROUTES } from "@/lib/constants";

type Props = {
  orderId: string;
  title: string;
  initialAmount: number;
  initialDiscount: number;
  initialCouponCode: string | null;
  customerPhone: string | null;
};

export function PaymentCheckout({
  orderId,
  title,
  initialAmount,
  initialDiscount,
  initialCouponCode,
  customerPhone,
}: Props) {
  const [subtotal] = useState(initialAmount + initialDiscount);
  const [amount, setAmount] = useState(initialAmount);
  const [discountAmount, setDiscountAmount] = useState(initialDiscount);
  const [appliedCode, setAppliedCode] = useState(initialCouponCode);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [payStarted, setPayStarted] = useState(false);
  const [phone, setPhone] = useState(customerPhone ?? "");
  const [identityNumber, setIdentityNumber] = useState("");
  const [buyerError, setBuyerError] = useState("");

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCouponError("");
    setCouponLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Kupon uygulanamadı");
        return;
      }

      setAmount(data.order.amount);
      setDiscountAmount(data.order.discountAmount);
      setAppliedCode(data.order.couponCode);
      setCouponInput("");
    } catch {
      setCouponError("Bağlantı hatası");
    } finally {
      setCouponLoading(false);
    }
  }

  async function removeCoupon() {
    setCouponError("");
    setCouponLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Kupon kaldırılamadı");
        return;
      }

      setAmount(data.order.amount);
      setDiscountAmount(0);
      setAppliedCode(null);
    } catch {
      setCouponError("Bağlantı hatası");
    } finally {
      setCouponLoading(false);
    }
  }

  if (payStarted) {
    return (
      <IyzicoCheckout
        orderId={orderId}
        identityNumber={identityNumber.trim() || undefined}
        phone={phone.trim() || undefined}
      />
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-black text-[#083228]">{title}</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-[#53635f]">
            <span>Ara toplam</span>
            <span>{subtotal.toLocaleString("tr-TR")} ₺</span>
          </div>
          {discountAmount > 0 ? (
            <div className="flex justify-between text-[#087a61]">
              <span>İndirim {appliedCode ? `(${appliedCode})` : ""}</span>
              <span>-{discountAmount.toLocaleString("tr-TR")} ₺</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-black/5 pt-2 text-base font-black text-[#083228]">
            <span>Ödenecek tutar</span>
            <span>{amount.toLocaleString("tr-TR")} ₺</span>
          </div>
        </div>
      </div>

      {appliedCode ? (
        <div className="flex items-center justify-between rounded-xl bg-[#eef8f5] px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#087a61]">
            <Tag className="h-4 w-4" />
            {appliedCode} uygulandı
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            disabled={couponLoading}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#53635f] hover:bg-white"
            aria-label="Kuponu kaldır"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={applyCoupon} className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wide text-[#53635f]">
            Kupon kodu
          </label>
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="KUPONKODU"
              className="h-11 min-w-0 flex-1 rounded-xl border border-black/10 px-3 text-sm font-semibold uppercase text-[#083228] outline-none focus:border-[#087a61]/40 focus:ring-2 focus:ring-[#087a61]/10"
            />
            <Button type="submit" variant="outline" disabled={couponLoading}>
              Uygula
            </Button>
          </div>
          {couponError ? (
            <p className="text-sm font-semibold text-red-600">{couponError}</p>
          ) : null}
        </form>
      )}

      <div className="space-y-4 rounded-xl border border-black/5 bg-[#fafcfb] p-4">
        <p className="text-xs font-black uppercase tracking-wide text-[#53635f]">
          Ödeme bilgileri
        </p>
        {!customerPhone ? (
          <div className="space-y-2">
            <label
              htmlFor="payment-phone"
              className="text-xs font-bold text-[#53635f]"
            >
              Cep telefonu
            </label>
            <input
              id="payment-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0532 XXX XX XX"
              className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm font-semibold text-[#083228] outline-none focus:border-[#087a61]/40 focus:ring-2 focus:ring-[#087a61]/10"
            />
            <p className="text-xs text-[#7b8b87]">
              Telefon numaranızı{" "}
              <Link
                href={`${ROUTES.customer.profile}`}
                className="font-semibold text-[#087a61] hover:underline"
              >
                profilinizden
              </Link>{" "}
              de kaydedebilirsiniz.
            </p>
          </div>
        ) : null}
        <div className="space-y-2">
          <label
            htmlFor="payment-identity"
            className="text-xs font-bold text-[#53635f]"
          >
            TC kimlik numarası
          </label>
          <input
            id="payment-identity"
            inputMode="numeric"
            maxLength={11}
            value={identityNumber}
            onChange={(e) =>
              setIdentityNumber(e.target.value.replace(/\D/g, "").slice(0, 11))
            }
            placeholder="11 haneli TC kimlik no"
            className="h-11 w-full rounded-xl border border-black/10 px-3 text-sm font-semibold tracking-wide text-[#083228] outline-none focus:border-[#087a61]/40 focus:ring-2 focus:ring-[#087a61]/10"
          />
          <p className="text-xs text-[#7b8b87]">
            İyzico ödeme güvenliği için gereklidir; veritabanına kaydedilmez.
            Sandbox ortamında boş bırakılırsa admin panelindeki test kimliği
            kullanılır.
          </p>
        </div>
        {buyerError ? (
          <p className="text-sm font-semibold text-red-600">{buyerError}</p>
        ) : null}
      </div>

      <Button
        type="button"
        className="h-12 w-full"
        onClick={() => {
          setBuyerError("");
          if (!customerPhone && phone.trim().length < 10) {
            setBuyerError("Geçerli bir cep telefonu numarası girin.");
            return;
          }
          if (identityNumber.trim() && identityNumber.trim().length !== 11) {
            setBuyerError("TC kimlik numarası 11 haneli olmalıdır.");
            return;
          }
          setPayStarted(true);
        }}
      >
        {amount.toLocaleString("tr-TR")} ₺ — Ödemeye geç
      </Button>
    </div>
  );
}
