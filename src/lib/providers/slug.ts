import { toSlug } from "@/lib/slug";

type ProviderSlugDb = {
  provider: {
    findUnique: (args: {
      where: { slug: string };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
  };
};

export async function createUniqueProviderSlug(
  db: ProviderSlugDb,
  fullName: string,
  currentProviderId?: string,
) {
  const base = toSlug(fullName) || "usta";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await db.provider.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === currentProviderId) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

