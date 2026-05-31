import { db } from "@/lib/db";

export const SITE_KEYS = {
  siteName: "site_name",
  supportEmail: "support_email",
  maintenanceMode: "maintenance_mode",
  heroTagline: "hero_tagline",
} as const;

export type SiteSettings = {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  heroTagline: string;
};

const DEFAULTS: SiteSettings = {
  siteName: process.env.NEXT_PUBLIC_APP_NAME ?? "ProfUSTA",
  supportEmail: "destek@profusta.com",
  maintenanceMode: false,
  heroTagline: "Güvenilir usta, hızlı hizmet",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await db.platformSetting.findMany({
    where: { key: { in: Object.values(SITE_KEYS) } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    siteName: map.get(SITE_KEYS.siteName) ?? DEFAULTS.siteName,
    supportEmail: map.get(SITE_KEYS.supportEmail) ?? DEFAULTS.supportEmail,
    maintenanceMode: map.get(SITE_KEYS.maintenanceMode) === "1",
    heroTagline: map.get(SITE_KEYS.heroTagline) ?? DEFAULTS.heroTagline,
  };
}

export async function setSiteSettings(data: Partial<SiteSettings>) {
  const upserts: Promise<unknown>[] = [];
  if (data.siteName != null) {
    upserts.push(upsert(SITE_KEYS.siteName, data.siteName));
  }
  if (data.supportEmail != null) {
    upserts.push(upsert(SITE_KEYS.supportEmail, data.supportEmail));
  }
  if (data.maintenanceMode != null) {
    upserts.push(upsert(SITE_KEYS.maintenanceMode, data.maintenanceMode ? "1" : "0"));
  }
  if (data.heroTagline != null) {
    upserts.push(upsert(SITE_KEYS.heroTagline, data.heroTagline));
  }
  await Promise.all(upserts);
}

async function upsert(key: string, value: string) {
  await db.platformSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
