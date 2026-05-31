import { db } from "@/lib/db";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage/defaults";
import type { HomepageConfigData } from "@/lib/homepage/defaults";

export async function upsertHomepageConfig(data: Partial<HomepageConfigData>) {
  return db.homepageConfig.upsert({
    where: { id: "default" },
    create: { id: "default", ...DEFAULT_HOMEPAGE_CONFIG, ...data },
    update: data,
  });
}
