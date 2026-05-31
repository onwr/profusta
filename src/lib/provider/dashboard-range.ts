export type ProviderDashboardRange = "today" | "week" | "month" | "last30";

export const DASHBOARD_RANGE_OPTIONS: {
  value: ProviderDashboardRange;
  label: string;
}[] = [
  { value: "today", label: "Bugün" },
  { value: "week", label: "Bu Hafta" },
  { value: "month", label: "Bu Ay" },
  { value: "last30", label: "Son 30 Gün" },
];

export function parseDashboardRange(
  value?: string | null,
): ProviderDashboardRange {
  const found = DASHBOARD_RANGE_OPTIONS.find((o) => o.value === value);
  return found?.value ?? "week";
}

export function getDashboardRangeLabel(range: ProviderDashboardRange) {
  return (
    DASHBOARD_RANGE_OPTIONS.find((o) => o.value === range)?.label ?? "Bu Hafta"
  );
}

export type DashboardRangeBounds = {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  chartDays: number;
  completedSub: string;
  earningsTitle: string;
  prevPeriodLabel: string;
  comparisonHint: string;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() - n);
  return d;
}

export function getDashboardRangeBounds(
  range: ProviderDashboardRange,
): DashboardRangeBounds {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (range === "today") {
    const start = startOfDay(now);
    const prevStart = daysAgo(1);
    const prevEnd = start;
    return {
      start,
      end,
      prevStart,
      prevEnd,
      chartDays: 1,
      completedSub: "Bugün tamamlanan",
      earningsTitle: "Bugünkü Kazancınız",
      prevPeriodLabel: "Dün",
      comparisonHint: "Düne göre",
    };
  }

  if (range === "month") {
    const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const prevStart = startOfDay(
      new Date(now.getFullYear(), now.getMonth() - 1, 1),
    );
    const prevEnd = start;
    const chartDays = now.getDate();
    return {
      start,
      end,
      prevStart,
      prevEnd,
      chartDays,
      completedSub: "Bu ay tamamlanan",
      earningsTitle: "Bu Ay Kazancınız",
      prevPeriodLabel: "Geçen ay",
      comparisonHint: "Geçen aya göre",
    };
  }

  if (range === "last30") {
    const start = daysAgo(29);
    const prevStart = daysAgo(59);
    const prevEnd = new Date(start);
    return {
      start,
      end,
      prevStart,
      prevEnd,
      chartDays: 30,
      completedSub: "Son 30 günde",
      earningsTitle: "Son 30 Gün Kazancınız",
      prevPeriodLabel: "Önceki 30 gün",
      comparisonHint: "Önceki 30 güne göre",
    };
  }

  const start = daysAgo(6);
  const prevStart = daysAgo(13);
  const prevEnd = new Date(start);
  return {
    start,
    end,
    prevStart,
    prevEnd,
    chartDays: 7,
    completedSub: "Bu hafta tamamlanan",
    earningsTitle: "Bu Hafta Kazancınız",
    prevPeriodLabel: "Önceki hafta",
    comparisonHint: "Önceki haftaya göre",
  };
}

/** Grafik X ekseni etiketi */
export function chartDayLabel(
  range: ProviderDashboardRange,
  dayStart: Date,
): string {
  if (range === "today") return "Bugün";
  if (range === "month") {
    return dayStart.toLocaleDateString("tr-TR", { day: "numeric" });
  }
  if (range === "last30") {
    return dayStart.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  }
  return dayStart.toLocaleDateString("tr-TR", { weekday: "short" });
}

/** Aralıktaki gün başlangıcı (i = 0 .. chartDays-1) */
export function chartDayAt(
  range: ProviderDashboardRange,
  rangeStart: Date,
  index: number,
): Date {
  const d = new Date(rangeStart);
  if (range === "month") {
    d.setDate(index + 1);
  } else {
    d.setDate(rangeStart.getDate() + index);
  }
  d.setHours(0, 0, 0, 0);
  return d;
}
