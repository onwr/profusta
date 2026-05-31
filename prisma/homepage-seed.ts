import { HomepageItemType } from "../src/generated/prisma/client";
import { db } from "../src/lib/db";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  DEFAULT_HOMEPAGE_ITEMS,
} from "../src/lib/homepage/defaults";

export async function seedHomepage() {
  await db.homepageConfig.upsert({
    where: { id: "default" },
    create: { id: "default", ...DEFAULT_HOMEPAGE_CONFIG },
    update: DEFAULT_HOMEPAGE_CONFIG,
  });

  const existing = await db.homepageItem.count();
  if (existing > 0) {
    console.log("Anasayfa öğeleri zaten mevcut, atlanıyor");
    return;
  }

  const seedItems = DEFAULT_HOMEPAGE_ITEMS.filter(
    (item) => item.type !== "FEATURED_SERVICE",
  );

  for (const item of seedItems) {
    await db.homepageItem.create({
      data: {
        type: item.type as HomepageItemType,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        body: item.body,
        priceLabel: item.priceLabel,
        icon: item.icon,
        href: item.href,
        stepNumber: item.stepNumber,
        bullets: item.bullets ?? undefined,
        rating: item.rating,
        serviceId: null,
        listingId: null,
        imageUrl: null,
      },
    });
  }

  console.log(
    `Anasayfa: config + ${seedItems.length} öğe seed edildi (popüler hizmetler dinamik)`,
  );
}
