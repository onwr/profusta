import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="min-h-screen container mx-auto w-full bg-[#f7f7f3]">
      <div
        className={cn(
          "mx-auto grid min-h-[calc(100vh-48px)] max-w-screen-2xl overflow-hidden rounded-[34px] border border-black/5 bg-white shadow-[0_24px_80px_rgba(8,50,40,0.08)] lg:grid-cols-[45%_55%]",
          className
        )}
      >
        <section className="relative hidden min-h-0 overflow-hidden bg-linear-to-br from-[#f5faf7] via-white to-[#eef8f5] px-12 py-12 lg:flex lg:flex-col">

          <div className="shrink-0">
            <h2 className="max-w-[380px] text-[38px] font-black leading-[1.08] tracking-[-0.04em] text-[#083228]">
              Ev işlerinde
              <br />
              güvenilir yardım,
              <br />
              bir tık uzağınızda!
            </h2>

            <p className="mt-7 max-w-[320px] text-[17px] leading-8 text-[#53635f]">
              ProfUsta ile ihtiyacınız olan hizmete hızlıca ulaşın.
            </p>
          </div>

          <div className="relative w-full flex-1 min-h-[clamp(400px,42vh,620px)]">
            <Image
              src="/login-image.png"
              alt="ProfUsta giriş görseli"
              fill
              sizes="(max-width: 1024px) 50vw, 620px"
              className="object-contain object-center scale-[1.55] origin-center"
              priority
            />
          </div>

          <div className="shrink-0 mt-10 space-y-7 pb-2">
            <Feature
              icon={<BadgeCheck className="h-5 w-5" />}
              title="Güvenilir ustalar"
              text="Tüm ustalarımız doğrulanmıştır."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Hızlı ve kolay"
              text="İhtiyacınızı girin, teklifleri alın."
            />
            <Feature
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Memnuniyet garantisi"
              text="%100 müşteri memnuniyeti odaklı."
            />
          </div>
        </section>

        <section className="relative flex min-h-screen bg-[#087A61] md:bg-transparent flex-col px-6 py-8 sm:px-10 lg:min-h-0 lg:py-12">
    

          <div className="flex flex-1 md:items-center justify-center">
            <div className="w-full max-w-[520px] rounded-[28px] border border-black/5 bg-white p-8 shadow-[0_20px_60px_rgba(8,50,40,0.08)] sm:p-10">
              <h1 className="text-[34px] font-black tracking-[-0.04em] text-[#083228]">
                {title}
              </h1>

              {subtitle ? (
                <p className="mt-3 text-[16px] leading-7 text-[#53635f]">
                  {subtitle}
                </p>
              ) : null}

              <div className="mt-9">{children}</div>

              {footer ? (
                <div className="mt-8 text-center text-sm font-medium">
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e5f3ef] text-[#087a61]">
        {icon}
      </div>

      <div>
        <h3 className="text-[16px] font-black text-[#083228]">{title}</h3>
        <p className="mt-1 text-sm text-[#53635f]">{text}</p>
      </div>
    </div>
  );
}