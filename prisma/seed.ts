import "dotenv/config";
import { UserRole } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { db } from "../src/lib/db";
import { seedHomepage } from "./homepage-seed";
import {
  categorySlug,
  SEED_CATEGORIES,
  serviceSlug,
} from "./seed-data";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@profusta.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin1234!";
  const fullName = process.env.ADMIN_NAME ?? "ProfUSTA Admin";

  await db.user.upsert({
    where: { email },
    update: {
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      email,
      fullName,
      passwordHash: await hashPassword(password),
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin kullanıcı hazır: ${email}`);
}

async function seedCategories() {
  let order = 0;
  for (const cat of SEED_CATEGORIES) {
    const slug = categorySlug(cat.name);
    const category = await db.category.upsert({
      where: { slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        sortOrder: order,
        isActive: true,
      },
      create: {
        slug,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        sortOrder: order,
        isActive: true,
      },
    });

    let serviceOrder = 0;
    for (const svc of cat.services) {
      const sSlug = serviceSlug(svc.name);
      await db.service.upsert({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: sSlug,
          },
        },
        update: {
          name: svc.name,
          description: svc.description ?? null,
          sortOrder: serviceOrder,
          isActive: true,
        },
        create: {
          categoryId: category.id,
          slug: sSlug,
          name: svc.name,
          description: svc.description ?? null,
          sortOrder: serviceOrder,
          isActive: true,
        },
      });
      serviceOrder += 1;
    }
    order += 1;
  }

  console.log(`${SEED_CATEGORIES.length} kategori ve alt hizmetler seed edildi`);
}

async function seedPlatformSettings() {
  await db.platformSetting.upsert({
    where: { key: "commission_rate_percent" },
    create: { key: "commission_rate_percent", value: "10" },
    update: {},
  });
  await db.platformSetting.upsert({
    where: { key: "service_areas" },
    create: {
      key: "service_areas",
      value: JSON.stringify({ enabled: { istanbul: ["kadikoy"] } }),
    },
    update: {},
  });
  console.log("Platform ayarları (komisyon %10, hizmet bölgeleri) hazır");
}

async function main() {
  await seedAdmin();
  await seedCategories();
  await seedPlatformSettings();
  await seedHomepage();
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
