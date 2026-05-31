import {
  BalanceEntryType,
  OfferStatus,
  OrderStatus,
  PayoutStatus,
  RequestStatus,
} from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getProviderAvailableBalance } from "@/lib/orders/transitions";
import { getProviderRating } from "@/lib/reviews/aggregate";
import {
  getProviderMessageResponseStats,
  getProviderOfferResponseMinutes,
} from "@/lib/provider/response-stats";
import {
  chartDayAt,
  chartDayLabel,
  getDashboardRangeBounds,
  getDashboardRangeLabel,
  type ProviderDashboardRange,
} from "@/lib/provider/dashboard-range";

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PAID_ESCROW,
  OrderStatus.PROVIDER_ACCEPTED,
  OrderStatus.IN_PROGRESS,
  OrderStatus.COMPLETED_BY_PROVIDER,
];

const COMPLETED_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.COMPLETED,
  OrderStatus.PAYOUT_PENDING,
  OrderStatus.PAYOUT_COMPLETED,
];

function trendPercent(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export type ProviderNavCounts = {
  newRequestsCount: number;
  activeJobsCount: number;
  unreadMessagesCount: number;
  pendingOffersCount: number;
};

export async function getProviderNavCounts(
  providerId: string,
  userId: string,
): Promise<ProviderNavCounts> {
  const [newRequestsCount, activeJobsCount, unreadMessagesCount, pendingOffersCount] =
    await Promise.all([
      db.requestProviderMatch.count({
        where: {
          providerId,
          request: {
            status: RequestStatus.OPEN,
            offers: { none: { providerId } },
          },
        },
      }),
      db.order.count({
        where: { providerId, status: { in: ACTIVE_ORDER_STATUSES } },
      }),
      db.message.count({
        where: {
          readAt: null,
          conversation: { providerId },
          senderId: { not: userId },
        },
      }),
      db.offer.count({
        where: { providerId, status: OfferStatus.PENDING },
      }),
    ]);

  return {
    newRequestsCount,
    activeJobsCount,
    unreadMessagesCount,
    pendingOffersCount,
  };
}

export type ProviderDashboardData = {
  fullName: string;
  profession: string;
  ratingAvg: number | null;
  reviewCount: number;
  stats: {
    newRequests: { value: number; trend: number | null; sub: string };
    offersSent: { value: number; trend: number | null; sub: string };
    activeJobs: { value: number; trend: number | null; sub: string };
    completedWeek: { value: number; trend: number | null; sub: string };
    rating: { value: string; trend: number | null; sub: string };
  };
  earningsByDay: { label: string; amount: number }[];
  jobDistribution: {
    completed: number;
    active: number;
    offerStage: number;
    rangeLabel: string;
  };
  incomingRequests: {
    id: string;
    categoryName: string;
    city: string;
    district: string | null;
    distanceKm: number;
    createdAt: Date;
  }[];
  activeJobs: {
    id: string;
    title: string;
    customerName: string;
    city: string | null;
    amount: number;
    status: OrderStatus;
    scheduledAt: Date | null;
  }[];
  wallet: {
    available: number;
    pending: number;
    totalEarned: number;
    withdrawn: number;
  };
  appointments: {
    id: string;
    title: string;
    customerName: string;
    scheduledAt: Date;
    city: string | null;
    isToday: boolean;
    isTomorrow: boolean;
  }[];
  performance: {
    responseMinutes: number | null;
    responseSource: "messages" | "offers" | null;
    responseTrendMinutes: number | null;
    acceptanceRate: number | null;
    acceptanceTrend: number | null;
    satisfactionPercent: number | null;
  };
  welcome: {
    rangeLabel: string;
    periodEarnings: number;
    prevPeriodEarnings: number;
    periodEarningsTrend: number | null;
  };
};

export async function getProviderDashboardData(
  providerId: string,
  userId: string,
  fullName: string,
  range: ProviderDashboardRange = "week",
): Promise<ProviderDashboardData> {
  const bounds = getDashboardRangeBounds(range);
  const { start: rangeStart, prevStart, prevEnd } = bounds;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const provider = await db.provider.findUnique({
    where: { id: providerId },
    include: {
      categories: { take: 1 },
      user: { select: { fullName: true } },
    },
  });

  let profession = "Usta";
  if (provider?.categories[0]) {
    const cat = await db.category.findFirst({
      where: { slug: provider.categories[0].categorySlug },
      select: { name: true },
    });
    if (cat) profession = cat.name;
  }

  const rating = await getProviderRating(providerId);

  const [
    newRequestsWeek,
    newRequestsPrev,
    offersWeek,
    offersPrev,
    activeNow,
    activePrevStart,
    completedWeek,
    completedPrev,
    balanceEntries,
    prevBalanceEntries,
    offersPending,
    matchesIncoming,
    activeOrders,
    allCredits,
    payoutsCompleted,
    activeOrdersNet,
    offersForResponse,
    conversationsForResponse,
  ] = await Promise.all([
    db.requestProviderMatch.count({
      where: {
        providerId,
        createdAt: { gte: rangeStart, lte: bounds.end },
      },
    }),
    db.requestProviderMatch.count({
      where: {
        providerId,
        createdAt: { gte: prevStart, lt: prevEnd },
      },
    }),
    db.offer.count({
      where: {
        providerId,
        createdAt: { gte: rangeStart, lte: bounds.end },
      },
    }),
    db.offer.count({
      where: {
        providerId,
        createdAt: { gte: prevStart, lt: prevEnd },
      },
    }),
    db.order.count({
      where: { providerId, status: { in: ACTIVE_ORDER_STATUSES } },
    }),
    db.order.count({
      where: {
        providerId,
        status: { in: ACTIVE_ORDER_STATUSES },
        createdAt: { lt: rangeStart },
      },
    }),
    db.order.count({
      where: {
        providerId,
        status: { in: COMPLETED_ORDER_STATUSES },
        completedAt: { gte: rangeStart, lte: bounds.end },
      },
    }),
    db.order.count({
      where: {
        providerId,
        status: { in: COMPLETED_ORDER_STATUSES },
        completedAt: { gte: prevStart, lt: prevEnd },
      },
    }),
    db.providerBalance.findMany({
      where: {
        providerId,
        type: BalanceEntryType.CREDIT,
        createdAt: { gte: rangeStart, lte: bounds.end },
      },
      select: { amount: true, createdAt: true },
    }),
    db.providerBalance.findMany({
      where: {
        providerId,
        type: BalanceEntryType.CREDIT,
        createdAt: { gte: prevStart, lt: prevEnd },
      },
      select: { amount: true },
    }),
    db.offer.count({
      where: { providerId, status: OfferStatus.PENDING },
    }),
    db.requestProviderMatch.findMany({
      where: {
        providerId,
        request: { status: RequestStatus.OPEN },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        request: {
          include: {
            category: { select: { name: true } },
          },
        },
      },
    }),
    db.order.findMany({
      where: { providerId, status: { in: ACTIVE_ORDER_STATUSES } },
      orderBy: { createdAt: "desc" },
      take: 2,
      include: {
        customer: { select: { fullName: true } },
        privateOffer: { select: { scheduledAt: true } },
        requestOffer: {
          include: {
            request: {
              select: { city: true, district: true, preferredDate: true },
            },
          },
        },
      },
    }),
    db.providerBalance.findMany({
      where: { providerId, type: BalanceEntryType.CREDIT },
      select: { amount: true },
    }),
    db.payout.findMany({
      where: { providerId, status: PayoutStatus.PAID },
      select: { amount: true },
    }),
    db.order.findMany({
      where: { providerId, status: { in: ACTIVE_ORDER_STATUSES } },
      select: { netAmount: true },
    }),
    db.offer.findMany({
      where: { providerId },
      select: { createdAt: true, status: true, requestId: true },
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
    db.conversation.findMany({
      where: { providerId },
      select: {
        customerId: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: { senderId: true, createdAt: true },
        },
      },
    }),
  ]);

  const periodEarnings =
    Math.round(
      balanceEntries.reduce((s, e) => s + e.amount, 0) * 100,
    ) / 100;
  const prevPeriodEarnings =
    Math.round(
      prevBalanceEntries.reduce((s, e) => s + e.amount, 0) * 100,
    ) / 100;

  const available = await getProviderAvailableBalance(providerId);
  const totalEarned = allCredits.reduce((s, e) => s + e.amount, 0);
  const withdrawn = payoutsCompleted.reduce((s, p) => s + p.amount, 0);
  const pending = activeOrdersNet.reduce((s, o) => s + o.netAmount, 0);

  const earningsByDay: { label: string; amount: number }[] = [];
  for (let i = 0; i < bounds.chartDays; i++) {
    const d = chartDayAt(range, rangeStart, i);
    const key = d.getTime();
    let amount = 0;
    for (const e of balanceEntries) {
      const ed = new Date(e.createdAt);
      ed.setHours(0, 0, 0, 0);
      if (ed.getTime() === key) amount += e.amount;
    }
    earningsByDay.push({
      label: chartDayLabel(range, d),
      amount: Math.round(amount * 100) / 100,
    });
  }

  const matchIds = offersForResponse.map((o) => o.requestId);
  const matchesForOffers = await db.requestProviderMatch.findMany({
    where: {
      providerId,
      requestId: { in: matchIds },
    },
    select: { requestId: true, createdAt: true },
  });
  const matchByRequest = new Map(
    matchesForOffers.map((m) => [m.requestId, m.createdAt]),
  );

  const messageResponse = getProviderMessageResponseStats(
    conversationsForResponse,
    userId,
  );
  const messageResponsePrev = getProviderMessageResponseStats(
    conversationsForResponse,
    userId,
    { since: prevStart, until: prevEnd },
  );
  const messageResponseCurrent = getProviderMessageResponseStats(
    conversationsForResponse,
    userId,
    { since: rangeStart, until: bounds.end },
  );

  const offerResponseMinutes = getProviderOfferResponseMinutes(
    offersForResponse,
    matchByRequest,
  );

  let responseMinutes: number | null = null;
  let responseSource: "messages" | "offers" | null = null;

  if (messageResponse.averageMinutes != null) {
    responseMinutes = messageResponse.averageMinutes;
    responseSource = "messages";
  } else if (offerResponseMinutes != null) {
    responseMinutes = offerResponseMinutes;
    responseSource = "offers";
  }

  let responseTrendMinutes: number | null = null;
  if (
    messageResponseCurrent.averageMinutes != null &&
    messageResponsePrev.averageMinutes != null
  ) {
    responseTrendMinutes =
      messageResponseCurrent.averageMinutes -
      messageResponsePrev.averageMinutes;
  }

  const totalOffers = offersForResponse.length;
  const acceptedOffers = offersForResponse.filter(
    (o) => o.status === OfferStatus.ACCEPTED,
  ).length;
  const acceptanceRate =
    totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : null;

  const offersCurrentPeriod = offersForResponse.filter(
    (o) => o.createdAt >= rangeStart && o.createdAt <= bounds.end,
  );
  const offersPrevPeriod = offersForResponse.filter(
    (o) => o.createdAt >= prevStart && o.createdAt < prevEnd,
  );
  const acceptanceCurrent =
    offersCurrentPeriod.length > 0
      ? Math.round(
          (offersCurrentPeriod.filter((o) => o.status === OfferStatus.ACCEPTED)
            .length /
            offersCurrentPeriod.length) *
            100,
        )
      : null;
  const acceptancePrev =
    offersPrevPeriod.length > 0
      ? Math.round(
          (offersPrevPeriod.filter((o) => o.status === OfferStatus.ACCEPTED)
            .length /
            offersPrevPeriod.length) *
            100,
        )
      : null;
  const acceptanceTrend =
    acceptanceCurrent != null && acceptancePrev != null
      ? acceptanceCurrent - acceptancePrev
      : null;

  const satisfactionPercent =
    rating.ratingAvg != null
      ? Math.round((rating.ratingAvg / 5) * 100)
      : null;

  const upcomingOrders = await db.order.findMany({
    where: {
      providerId,
      status: { in: ACTIVE_ORDER_STATUSES },
      OR: [
        { privateOffer: { is: { scheduledAt: { not: null } } } },
        {
          requestOffer: {
            is: { request: { is: { preferredDate: { not: null } } } },
          },
        },
      ],
    },
    include: {
      customer: { select: { fullName: true } },
      privateOffer: { select: { scheduledAt: true } },
      requestOffer: {
        include: {
          request: {
            select: { city: true, district: true, preferredDate: true },
          },
        },
      },
    },
    take: 5,
  });

  const appointments = upcomingOrders
    .map((o) => {
      const scheduledAt =
        o.privateOffer?.scheduledAt ??
        (o.requestOffer?.request.preferredDate
          ? new Date(o.requestOffer.request.preferredDate)
          : null);
      if (!scheduledAt) return null;
      const req = o.requestOffer?.request;
      const city = req
        ? req.district
          ? `${req.city}, ${req.district}`
          : req.city
        : null;
      const day = new Date(scheduledAt);
      day.setHours(0, 0, 0, 0);
      return {
        id: o.id,
        title: o.title,
        customerName: o.customer.fullName,
        scheduledAt,
        city,
        isToday: day.getTime() === today.getTime(),
        isTomorrow: day.getTime() === tomorrow.getTime(),
      };
    })
    .filter((a): a is NonNullable<typeof a> => a != null)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
    .slice(0, 4);

  return {
    fullName: provider?.user.fullName ?? fullName,
    profession,
    ratingAvg: rating.ratingAvg,
    reviewCount: rating.reviewCount,
    stats: {
      newRequests: {
        value: newRequestsWeek,
        trend: trendPercent(newRequestsWeek, newRequestsPrev),
        sub: "Yeni talep",
      },
      offersSent: {
        value: offersWeek,
        trend: trendPercent(offersWeek, offersPrev),
        sub: "Gönderilen teklif",
      },
      activeJobs: {
        value: activeNow,
        trend: trendPercent(activeNow, activePrevStart),
        sub: "Devam eden iş",
      },
      completedWeek: {
        value: completedWeek,
        trend: trendPercent(completedWeek, completedPrev),
        sub: bounds.completedSub,
      },
      rating: {
        value:
          rating.ratingAvg != null
            ? `${rating.ratingAvg} (${rating.reviewCount})`
            : "—",
        trend: null,
        sub: "Ortalama puan",
      },
    },
    earningsByDay,
    jobDistribution: {
      completed: completedWeek,
      active: activeNow,
      offerStage: offersPending,
      rangeLabel: getDashboardRangeLabel(range),
    },
    incomingRequests: matchesIncoming.map((m) => ({
      id: m.request.id,
      categoryName: m.request.category.name,
      city: m.request.city,
      district: m.request.district,
      distanceKm: m.distanceKm,
      createdAt: m.request.createdAt,
    })),
    activeJobs: activeOrders.map((o) => {
      const req = o.requestOffer?.request;
      const scheduledAt =
        o.privateOffer?.scheduledAt ??
        (req?.preferredDate ? new Date(req.preferredDate) : null);
      return {
        id: o.id,
        title: o.title,
        customerName: o.customer.fullName,
        city: req
          ? req.district
            ? `${req.city}, ${req.district}`
            : req.city
          : null,
        amount: o.amount,
        status: o.status,
        scheduledAt,
      };
    }),
    wallet: {
      available,
      pending: Math.round(pending * 100) / 100,
      totalEarned: Math.round(totalEarned * 100) / 100,
      withdrawn: Math.round(withdrawn * 100) / 100,
    },
    appointments,
    performance: {
      responseMinutes,
      responseSource,
      responseTrendMinutes,
      acceptanceRate,
      acceptanceTrend,
      satisfactionPercent,
    },
    welcome: {
      rangeLabel: getDashboardRangeLabel(range),
      periodEarnings,
      prevPeriodEarnings,
      periodEarningsTrend: trendPercent(periodEarnings, prevPeriodEarnings),
    },
  };
}
