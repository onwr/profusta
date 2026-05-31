import { renderEmail, type EmailTemplate } from "@/lib/email/templates";

type SendInput = {
  to: string;
  template: EmailTemplate;
  vars: Record<string, string>;
};

export async function sendTemplatedEmail(input: SendInput) {
  const { subject, html, text } = renderEmail(input.template, input.vars);
  return sendRawEmail({ to: input.to, subject, html, text });
}

/** MVP: SMTP yoksa konsola yazar; SMTP_* doluysa basit HTTP relay veya log. */
export async function sendRawEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    console.info("[email-dev]", {
      to: opts.to,
      subject: opts.subject,
      text: opts.text.slice(0, 300),
    });
    return { ok: true, dev: true };
  }

  console.info("[email-queued]", {
    host,
    to: opts.to,
    subject: opts.subject,
    note: "SMTP yapılandırıldı; production için nodemailer/resend entegre edilebilir.",
  });
  return { ok: true, queued: true };
}
