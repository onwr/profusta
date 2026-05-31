"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function IyzicoCheckout({
  orderId,
  identityNumber,
  phone,
}: {
  orderId: string;
  identityNumber?: string;
  phone?: string;
}) {
  const [paymentPageUrl, setPaymentPageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    fetch(`/api/orders/${orderId}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identityNumber,
        phone,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.paymentPageUrl) {
          setPaymentPageUrl(data.paymentPageUrl);
          setRedirecting(true);
          window.location.assign(data.paymentPageUrl);
        } else {
          setError(data.error ?? "Ödeme başlatılamadı");
        }
      })
      .catch(() => setError("Bağlantı hatası"));
  }, [orderId, identityNumber, phone]);

  if (error) {
    const isLocalCallback =
      error.includes("localhost") ||
      error.includes("ngrok") ||
      error.includes("IYZICO_CALLBACK");

    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
        {isLocalCallback ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-bold">Yerel geliştirme notu</p>
            <p className="mt-2">
              İyzico ödeme sayfası herkese açık bir adreste çalışır;{" "}
              <code className="text-xs">localhost</code> callback adresine
              iframe veya tarayıcı üzerinden erişemez (Private Network Access).
            </p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs">
              <li>
                <code className="text-[11px]">ngrok http 3000</code> (veya
                cloudflared) ile HTTPS tünel açın
              </li>
              <li>
                <code className="text-[11px]">.env</code> içinde{" "}
                <code className="text-[11px]">NEXT_PUBLIC_APP_URL</code> ve{" "}
                <code className="text-[11px]">Admin → İyzico Ayarları</code>{" "}
                içinde callback URL tünel adresiniz olmalı
              </li>
              <li>Dev sunucusunu yeniden başlatın</li>
            </ol>
          </div>
        ) : null}
      </div>
    );
  }

  if (redirecting && paymentPageUrl) {
    return (
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-6">
        <p className="text-sm text-[#53635f]">
          İyzico güvenli ödeme sayfasına yönlendiriliyorsunuz…
        </p>
        <p className="text-xs text-[#7b8b87]">
          Otomatik yönlendirme olmazsa aşağıdaki düğmeyi kullanın.
        </p>
        <Button
          type="button"
          className="h-11"
          onClick={() => window.location.assign(paymentPageUrl)}
        >
          Ödemeye devam et
        </Button>
      </div>
    );
  }

  return <p className="text-sm text-[#53635f]">Ödeme hazırlanıyor…</p>;
}
