const APP = process.env.NEXT_PUBLIC_APP_NAME ?? "ProfUSTA";

export type EmailTemplate = "offer" | "message" | "order";

export function renderEmail(
  template: EmailTemplate,
  vars: Record<string, string>,
): { subject: string; html: string; text: string } {
  switch (template) {
    case "offer":
      return {
        subject: `${APP} — Yeni teklif`,
        text: `${vars.providerName} talebinize ${vars.price} ₺ teklif verdi.\n${vars.link}`,
        html: wrap(
          `<h2>Yeni teklif</h2>
          <p><strong>${esc(vars.providerName)}</strong> «${esc(vars.requestTitle)}» talebinize <strong>${esc(vars.price)} ₺</strong> teklif verdi.</p>
          <p><a href="${esc(vars.link)}">Teklifleri görüntüle</a></p>`,
        ),
      };
    case "message":
      return {
        subject: `${APP} — Yeni mesaj`,
        text: `${vars.senderName}: ${vars.preview}\n${vars.link}`,
        html: wrap(
          `<h2>Yeni mesaj</h2>
          <p><strong>${esc(vars.senderName)}</strong> size mesaj gönderdi:</p>
          <p>${esc(vars.preview)}</p>
          <p><a href="${esc(vars.link)}">Mesajlara git</a></p>`,
        ),
      };
    case "order":
      return {
        subject: `${APP} — ${vars.title}`,
        text: `${vars.body}\nSipariş: ${vars.orderTitle}\n${vars.link}`,
        html: wrap(
          `<h2>${esc(vars.title)}</h2>
          <p>${esc(vars.body)}</p>
          <p>Sipariş: <strong>${esc(vars.orderTitle)}</strong></p>
          <p><a href="${esc(vars.link)}">Sipariş detayı</a></p>`,
        ),
      };
    default:
      return { subject: APP, text: "", html: wrap("<p>Bildirim</p>") };
  }
}

function wrap(body: string) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#083228">${body}<hr/><p style="font-size:12px;color:#53635f">${APP}</p></body></html>`;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
