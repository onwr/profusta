"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/auth/form-field";

type Settings = {
  clientId: string;
  hasClientSecret: boolean;
  redirectUri: string;
  javascriptOrigin: string;
  isConfigured: boolean;
};

const SECRET_PLACEHOLDER = "••••••••••••••••";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-lg border border-black/10 px-3 py-2 text-xs font-bold text-[#087a61] hover:bg-[#eef8f5]"
    >
      {copied ? "Kopyalandı" : label}
    </button>
  );
}

export function GoogleOAuthSettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/google-oauth")
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings as Settings;
        setSettings(s);
        setClientId(s.clientId);
        if (s.hasClientSecret) setClientSecret(SECRET_PLACEHOLDER);
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const payload: Record<string, string> = { clientId };
    if (clientSecret && clientSecret !== SECRET_PLACEHOLDER) {
      payload.clientSecret = clientSecret;
    }

    const res = await fetch("/api/admin/settings/google-oauth", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Ayarlar kaydedilemedi");
      return;
    }

    const s = data.settings as Settings;
    setSettings(s);
    if (s.hasClientSecret) setClientSecret(SECRET_PLACEHOLDER);
    setMessage("Google giriş ayarları kaydedildi");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-2xl border border-black/5 bg-white p-6"
      >
        {settings && !settings.isConfigured ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Google ile giriş/kayıt henüz aktif değil. Aşağıdaki alanları doldurun;
            sağdaki rehbere göre Google Cloud Console ayarlarını yapın.
          </p>
        ) : null}

        <label className="block text-sm font-semibold">
          Client ID
          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={`mt-1 ${inputClassName}`}
            placeholder="123456789-xxxx.apps.googleusercontent.com"
            autoComplete="off"
          />
        </label>

        <label className="block text-sm font-semibold">
          Client Secret
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            onFocus={() => {
              if (clientSecret === SECRET_PLACEHOLDER) setClientSecret("");
            }}
            className={`mt-1 ${inputClassName}`}
            placeholder={
              settings?.hasClientSecret
                ? "Değiştirmek için yeni değer girin"
                : "GOCSPX-..."
            }
            autoComplete="new-password"
          />
        </label>

        {settings ? (
          <div className="space-y-3 rounded-xl bg-[#f4f8f6] p-4 text-sm">
            <p className="font-bold text-[#083228]">
              Google Console&apos;a yapıştırılacak adresler
            </p>
            <p className="text-xs text-[#53635f]">
              <code className="text-[11px]">NEXT_PUBLIC_APP_URL</code> değerine
              göre hesaplanır (.env). Domain değişince bu alanlar da değişir.
            </p>
            <div>
              <span className="text-xs font-bold text-[#53635f]">
                Authorized JavaScript origins
              </span>
              <div className="mt-1 flex gap-2">
                <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-2 py-1.5 text-xs">
                  {settings.javascriptOrigin}
                </code>
                <CopyButton value={settings.javascriptOrigin} label="Kopyala" />
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-[#53635f]">
                Authorized redirect URIs
              </span>
              <div className="mt-1 flex gap-2">
                <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-2 py-1.5 text-xs">
                  {settings.redirectUri}
                </code>
                <CopyButton value={settings.redirectUri} label="Kopyala" />
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="text-sm font-semibold text-red-600">{error}</p>
        ) : null}
        {message ? (
          <p className="text-sm font-semibold text-[#087a61]">{message}</p>
        ) : null}

        <Button type="submit" disabled={loading || !settings} className="h-10">
          Kaydet
        </Button>
      </form>

      <aside className="rounded-2xl border border-black/5 bg-white p-6 text-sm text-[#53635f]">
        <h2 className="text-lg font-black text-[#083228]">
          Google Cloud Console kurulum rehberi
        </h2>
        <p className="mt-2">
          Aşağıdaki adımlarla Client ID ve Client Secret alırsınız. Ücretsizdir;
          canlıya geçmeden önce OAuth consent ekranını yayınlamanız gerekir.
        </p>

        <ol className="mt-6 list-decimal space-y-5 pl-5">
          <li>
            <strong className="text-[#083228]">Google Cloud projesi</strong>
            <br />
            <a
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#087a61] hover:underline"
            >
              console.cloud.google.com
            </a>{" "}
            → üstten proje seçin veya <em>Yeni Proje</em> oluşturun (ör.
            ProfUSTA).
          </li>
          <li>
            <strong className="text-[#083228]">OAuth consent screen</strong>
            <br />
            Sol menü: <em>APIs &amp; Services</em> → <em>OAuth consent screen</em>
            <br />
            User Type: <em>External</em> (herkese açık giriş için).
            <br />
            Uygulama adı, destek e-postası ve geliştirici iletişim bilgisini
            doldurun. Scopes: varsayılan <code>email</code>,{" "}
            <code>profile</code>, <code>openid</code> yeterlidir.
            <br />
            <span className="text-amber-800">
              Test modunda yalnızca &quot;Test users&quot; listesindeki Gmail
              hesapları giriş yapabilir. Canlıda <em>Publish app</em> gerekir.
            </span>
          </li>
          <li>
            <strong className="text-[#083228]">OAuth Client ID oluşturma</strong>
            <br />
            <em>APIs &amp; Services</em> → <em>Credentials</em> →{" "}
            <em>Create Credentials</em> → <em>OAuth client ID</em>
            <br />
            Application type: <em>Web application</em>
            <br />
            Name: örn. ProfUSTA Web
          </li>
          <li>
            <strong className="text-[#083228]">Authorized JavaScript origins</strong>
            <br />
            Sol formdaki <em>JavaScript origins</em> kutusundan kopyalayıp buraya
            ekleyin. Örnek: <code>https://staging.profusta.com</code> veya yerel
            test için ngrok adresi. <code>localhost</code> Google tarafında
            çalışır; Client ID tipi Web olmalıdır.
          </li>
          <li>
            <strong className="text-[#083228]">Authorized redirect URIs</strong>
            <br />
            Sol formdaki <em>redirect URI</em> değerini aynen ekleyin. Sonu{" "}
            <code>/api/auth/google/callback</code> ile biter. Uyuşmazsa Google
            &quot;redirect_uri_mismatch&quot; hatası verir.
          </li>
          <li>
            <strong className="text-[#083228]">Anahtarları panele girin</strong>
            <br />
            Oluşturduktan sonra çıkan <em>Client ID</em> ve{" "}
            <em>Client secret</em> değerlerini sol forma yapıştırıp Kaydet&apos;e
            basın. Secret yalnızca bir kez tam gösterilir; kaybederseniz yeni
            secret üretin.
          </li>
          <li>
            <strong className="text-[#083228]">Test</strong>
            <br />
            <code>/giris</code> veya <code>/kayit</code> sayfasında &quot;Google
            ile Devam Et&quot; → Google hesabı seçimi → panele yönlendirme.
          </li>
        </ol>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <p className="font-bold">Sık hatalar</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>
              <code>redirect_uri_mismatch</code> → Redirect URI Console ile birebir
              aynı değil
            </li>
            <li>
              <code>access_denied</code> → Test modunda e-posta Test users
              listesinde değil
            </li>
            <li>
              <code>google_config</code> → Admin panelde Client ID/Secret boş
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
