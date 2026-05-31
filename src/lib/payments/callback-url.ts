/** İyzico'nun ve tarayıcının erişebileceği herkese açık callback URL'si mi? */
export function isPublicCallbackUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local")
    ) {
      return false;
    }

    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return false;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return false;

    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export const LOCAL_CALLBACK_MESSAGE =
  "Yerel geliştirme için İyzico callback adresi localhost olamaz. ngrok (veya benzeri) ile HTTPS tünel açın; Admin → İyzico Ayarlarından callback URL'yi ve .env içinde NEXT_PUBLIC_APP_URL değerini tünel adresinize ayarlayın (ör. https://abc123.ngrok-free.app/api/payments/iyzico/callback).";
