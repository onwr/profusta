"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { inputClassName } from "@/components/auth/form-field";
import { cn } from "@/lib/utils";

const DURATION_PRESETS = [1, 2, 4, 8];
const WARRANTY_PRESETS = [
  "30 gün işçilik garantisi",
  "Parça ve işçilik garantisi",
  "1 yıl servis garantisi",
];

type FormState = {
  title: string;
  price: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  durationHours: string;
  warrantyNote: string;
};

const emptyForm: FormState = {
  title: "",
  price: "",
  description: "",
  scheduledDate: "",
  scheduledTime: "",
  durationHours: "",
  warrantyNote: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  onSent: () => void;
};

function formatPrice(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

function buildScheduledAt(date: string, time: string) {
  if (!date) return undefined;
  if (!time) return `${date}T12:00:00`;
  return `${date}T${time}:00`;
}

export function PrivateOfferModal({
  open,
  onClose,
  conversationId,
  onSent,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setError("");
    }
  }, [open]);

  const priceLabel = formatPrice(form.price);
  const descriptionLen = form.description.trim().length;

  const scheduledLabel = useMemo(() => {
    if (!form.scheduledDate) return null;
    const iso = buildScheduledAt(form.scheduledDate, form.scheduledTime);
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString("tr-TR", {
      dateStyle: "long",
      timeStyle: "short",
    });
  }, [form.scheduledDate, form.scheduledTime]);

  const titleLen = form.title.trim().length;
  const canSubmit =
    titleLen >= 3 &&
    Number(form.price) > 0 &&
    descriptionLen >= 10 &&
    !loading;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("İş adı, fiyat ve en az 10 karakterlik açıklama zorunludur");
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = buildScheduledAt(
        form.scheduledDate,
        form.scheduledTime,
      );

      const res = await fetch(
        `/api/conversations/${conversationId}/private-offers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            price: Number(form.price),
            description: form.description.trim(),
            scheduledAt: scheduledAt || undefined,
            durationHours: form.durationHours
              ? Number(form.durationHours)
              : undefined,
            warrantyNote: form.warrantyNote.trim() || undefined,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Teklif gönderilemedi");
        return;
      }
      onSent();
      onClose();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Özel teklif oluştur"
      description="Müşteriye özel fiyat, iş kapsamı ve randevu detaylarını tek seferde iletin."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-6"
            onClick={onClose}
            disabled={loading}
          >
            Vazgeç
          </Button>
          <Button
            type="submit"
            form="private-offer-form"
            disabled={!canSubmit}
            className="h-11 px-8"
          >
            {loading ? "Gönderiliyor..." : "Teklifi gönder"}
          </Button>
        </div>
      }
    >
      <form id="private-offer-form" onSubmit={onSubmit}>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <section className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#083228]">
                <FileText className="h-4 w-4 text-[#087a61]" />
                İş bilgisi
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-xs font-bold text-[#53635f]">
                  İşin adı *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  className={inputClassName}
                  placeholder="Örn. Mutfak dolabı montajı"
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-[#7b8b87]">
                  Sipariş ve detay sayfalarında bu başlık görünür.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#083228]">
                <Wallet className="h-4 w-4 text-[#087a61]" />
                Fiyatlandırma
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-xs font-bold text-[#53635f]">
                  Teklif tutarı (₺) *
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  step={1}
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  className={inputClassName}
                  placeholder="Örn. 2500"
                />
                {priceLabel ? (
                  <p className="mt-2 text-sm font-semibold text-[#087a61]">
                    Müşteri göreceği tutar: {priceLabel}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#083228]">
                <FileText className="h-4 w-4 text-[#087a61]" />
                İş detayı
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-xs font-bold text-[#53635f]">
                  Açıklama *
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className={cn(inputClassName, "min-h-[120px] resize-y")}
                  rows={5}
                  minLength={10}
                  maxLength={2000}
                  placeholder="Yapılacak işi, kullanılacak malzemeleri ve müşterinin bilmesi gereken koşulları yazın..."
                />
                <p
                  className={cn(
                    "mt-1 text-xs",
                    descriptionLen < 10
                      ? "text-amber-700"
                      : "text-[#7b8b87]",
                  )}
                >
                  {descriptionLen}/2000 karakter (min. 10)
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#083228]">
                <Calendar className="h-4 w-4 text-[#087a61]" />
                Zamanlama
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#53635f]">
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => update("scheduledDate", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#53635f]">
                    Saat
                  </label>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) => update("scheduledTime", e.target.value)}
                    className={inputClassName}
                    disabled={!form.scheduledDate}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-xs font-bold text-[#53635f]">
                  Tahmini süre (saat)
                </label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() =>
                        update("durationHours", String(h))
                      }
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-bold transition",
                        form.durationHours === String(h)
                          ? "bg-[#087a61] text-white"
                          : "bg-white text-[#083228] ring-1 ring-black/10 hover:bg-[#eef8f5]",
                      )}
                    >
                      {h} saat
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={form.durationHours}
                  onChange={(e) => update("durationHours", e.target.value)}
                  className={cn(inputClassName, "mt-3")}
                  placeholder="Özel süre"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#083228]">
                <Shield className="h-4 w-4 text-[#087a61]" />
                Garanti
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {WARRANTY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => update("warrantyNote", preset)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-left text-xs font-semibold transition",
                      form.warrantyNote === preset
                        ? "bg-[#087a61] text-white"
                        : "bg-white text-[#083228] ring-1 ring-black/10 hover:bg-[#eef8f5]",
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                value={form.warrantyNote}
                onChange={(e) => update("warrantyNote", e.target.value)}
                className={cn(inputClassName, "mt-3")}
                placeholder="Özel garanti notu (opsiyonel)"
              />
            </section>

            {error ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}
          </div>

          <aside className="lg:col-span-2">
            <div className="sticky top-0 rounded-2xl border border-[#087a61]/20 bg-gradient-to-b from-[#eef8f5] to-white p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#087a61]">
                <Sparkles className="h-4 w-4" />
                Müşteri önizlemesi
              </div>
              <p className="mt-4 text-lg font-black text-[#083228]">
                {form.title.trim() || (
                  <span className="italic text-[#7b8b87]">İş adı…</span>
                )}
              </p>
              <p className="mt-1 text-3xl font-black text-[#087a61]">
                {priceLabel ?? "—"}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#53635f]">
                Kabul edildiğinde ödeme adımına yönlendirilir
              </p>

              <div className="mt-5 space-y-3 border-t border-[#087a61]/15 pt-4 text-sm text-[#53635f]">
                <p className="whitespace-pre-wrap text-[#083228]">
                  {form.description.trim() || (
                    <span className="italic text-[#7b8b87]">
                      Açıklama burada görünecek…
                    </span>
                  )}
                </p>

                {scheduledLabel ? (
                  <p className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#087a61]" />
                    <span>{scheduledLabel}</span>
                  </p>
                ) : null}

                {form.durationHours ? (
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-[#087a61]" />
                    <span>Tahmini süre: {form.durationHours} saat</span>
                  </p>
                ) : null}

                {form.warrantyNote.trim() ? (
                  <p className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#087a61]" />
                    <span>{form.warrantyNote.trim()}</span>
                  </p>
                ) : null}
              </div>

              <ul className="mt-5 list-inside list-disc space-y-1 text-xs text-[#7b8b87]">
                <li>Telefon ve ödeme bilgisi mesajda paylaşılamaz</li>
                <li>Teklif sohbet içinde kart olarak görünür</li>
                <li>Müşteri kabul veya red seçebilir</li>
              </ul>
            </div>
          </aside>
        </div>
      </form>
    </Modal>
  );
}
