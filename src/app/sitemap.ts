import type { MetadataRoute } from "next";
import { ListingStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${base}${ROUTES.categories}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}${ROUTES.listings}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${base}${ROUTES.providers}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${base}${ROUTES.createRequest}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}${ROUTES.static.about}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}${ROUTES.static.faq}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const [categories, listings, providers] = await Promise.all([
      db.category.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      db.listing.findMany({
        where: { status: ListingStatus.ACTIVE },
        select: { id: true, updatedAt: true },
        take: 500,
      }),
      db.provider.findMany({
        where: { status: "APPROVED" },
        select: { id: true, updatedAt: true },
        take: 500,
      }),
    ]);

    return [
      ...staticRoutes,
      ...categories.map((c) => ({
        url: `${base}${ROUTES.categories}/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...listings.map((l) => ({
        url: `${base}${ROUTES.listings}/${l.id}`,
        lastModified: l.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.6,
      })),
      ...providers.map((p) => ({
        url: `${base}${ROUTES.providers}/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
