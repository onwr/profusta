import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export async function enforceRateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowSec: number,
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const result = await checkRateLimit(`${bucket}:${ip}`, limit, windowSec);
  if (result.ok) return null;

  return NextResponse.json(
    {
      error: `Çok fazla istek. ${result.retryAfterSec} saniye sonra tekrar deneyin.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSec) },
    },
  );
}
