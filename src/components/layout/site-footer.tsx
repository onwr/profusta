import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { FooterNewsletter } from "@/components/layout/footer-newsletter";
import { SiteLogo } from "@/components/layout/site-logo";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

const footerColumns = [
  {
    title: "Keşfet",
    links: [
      ["Hizmetler", "/hizmetler"],
      ["Ustalar", "/ustalar"],
      ["İlanlar", "/ilanlar"],
      ["Nasıl Çalışır?", ROUTES.static.howItWorks],
      ["Usta Ol", "/usta-ol"],
    ],
  },
  {
    title: "Kullanıcı",
    links: [
      ["Giriş Yap", ROUTES.login],
      ["Kayıt Ol", ROUTES.register],
      ["Taleplerim", ROUTES.customer.requests],
      ["Panel", ROUTES.customer.dashboard],
    ],
  },
  {
    title: "Destek",
    links: [
      ["SSS", ROUTES.static.faq],
      ["İletişim", ROUTES.static.contact],
      ["Gizlilik Politikası", ROUTES.static.privacy],
      ["Kullanım Şartları", ROUTES.static.terms],
      ["Hakkımızda", ROUTES.static.about],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e8ecf0] bg-[#f8fafc] text-[#0f1419]">
      <div className="mx-auto max-w-screen-2xl px-8 py-12 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
        <div className="grid gap-10 border-b border-[#e2e8f0] pb-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.4fr]">
          <div>
            <Link href="/" className="inline-flex">
              <SiteLogo width={135} height={42} className="h-9" />
            </Link>

            <p className="mt-5 max-w-[280px] text-sm leading-6 text-[#64748b]">
              Ev işlerinizi kolaylaştıran platform. Güvenilir ustalar, kaliteli
              hizmet, mutlu müşteriler.
            </p>

            <div className="mt-6 flex gap-3">
              <Social href={ROUTES.static.contact} label="Facebook" icon={<FaFacebookF size={14} />} />
              <Social href={ROUTES.static.contact} label="Instagram" icon={<FaInstagram size={14} />} />
              <Social href={ROUTES.static.contact} label="X" icon={<FaXTwitter size={14} />} />
              <Social href={ROUTES.static.contact} label="YouTube" icon={<FaYoutube size={14} />} />
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-black uppercase tracking-[0.08em] text-[#334155]">
                {column.title}
              </h4>

              <ul className="mt-5 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm font-medium text-[#64748b] transition hover:text-[#0f1419]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.08em] text-[#334155]">
              Bülten
            </h4>
            <p className="mt-5 text-sm text-[#64748b]">
              Yeniliklerden haberdar olun.
            </p>

            <FooterNewsletter />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-sm text-[#94a3b8] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ProfUsta. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

function Social({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={`${label} — iletişim`}
      className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#64748b] ring-1 ring-[#e2e8f0] transition hover:bg-[#f1f5f9] hover:text-[#0f1419]"
    >
      {icon}
    </Link>
  );
}
