"use client";

type Props = {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onUnavailable?: () => void;
};

export function SocialAuthButton({ icon, label, href, onUnavailable }: Props) {
  const className =
    "flex h-[56px] w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white text-sm font-black text-[#083228] transition hover:bg-[#f4f8f6]";

  if (href) {
    return (
      <a href={href} className={className}>
        {icon}
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (onUnavailable) {
          onUnavailable();
          return;
        }
        window.alert("Sosyal medya ile giriş yakında eklenecek.");
      }}
      className={className}
    >
      {icon}
      {label}
    </button>
  );
}
