type OfferWithProvider = {
  id: string;
  price: number;
  description: string;
  estimatedDuration: string | null;
  proposedDate: Date | null;
  status: string;
  createdAt: Date;
  provider: {
    id: string;
    slug: string | null;
    bio: string | null;
    user: { fullName: string; avatarUrl: string | null };
    categories: { categorySlug: string }[];
  };
  distanceKm?: number;
  providerRating?: { ratingAvg: number | null; reviewCount: number };
};

export function serializeOfferForCustomer(offer: OfferWithProvider) {
  const rating = offer.providerRating ?? {
    ratingAvg: null as number | null,
    reviewCount: 0,
  };
  return {
    id: offer.id,
    price: offer.price,
    description: offer.description,
    estimatedDuration: offer.estimatedDuration,
    proposedDate: offer.proposedDate,
    status: offer.status,
    createdAt: offer.createdAt,
    distanceKm: offer.distanceKm,
    provider: {
      id: offer.provider.id,
      slug: offer.provider.slug,
      fullName: offer.provider.user.fullName,
      avatarUrl: offer.provider.user.avatarUrl,
      bio: offer.provider.bio,
      categories: offer.provider.categories.map((c) => c.categorySlug),
      ...rating,
    },
  };
}
