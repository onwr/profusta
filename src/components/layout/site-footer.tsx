import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Headphones,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { FooterNewsletter } from "@/components/layout/footer-newsletter";

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
    <footer className="bg-[#06291f] text-white">
      <div className="bg-gradient-to-r from-[#087a61] via-[#07745d] to-[#063c30]">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-8 py-6 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:px-16 xl:px-20 2xl:px-24">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-[#087a61]">
              <Headphones className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-black">
                Yardıma mı ihtiyacınız var?
              </h3>
              <p className="mt-1 text-sm font-medium text-white/85">
                Destek ekibimiz 7/24 sizinle!
              </p>
            </div>
          </div>

          <Link
            href="/iletisim"
            className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-white px-10 text-sm font-black text-[#087a61] shadow-[0_14px_34px_rgba(0,0,0,.16)] transition hover:bg-[#f4f8f6]"
          >
            İletişime Geçin
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-8 py-12 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
        <div className="grid gap-10 border-b border-white/15 pb-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.4fr]">
          <div>
            <Link href="/" className="inline-flex">
              <Image
                src="/logo.png"
                alt="ProfUsta"
                width={135}
                height={42}
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>

            <p className="mt-5 max-w-[260px] text-sm leading-6 text-white/70">
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
              <h4 className="text-base font-black">{column.title}</h4>

              <ul className="mt-5 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm font-medium text-white/70 transition hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-base font-black">Bülten</h4>
            <p className="mt-5 text-sm text-white/70">
              Yeniliklerden haberdar olun.
            </p>

            <FooterNewsletter />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
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
      className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#087a61]"
    >
      {icon}
    </Link>
  );
}