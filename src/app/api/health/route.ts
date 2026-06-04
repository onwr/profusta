import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  let database: "ok" | "error" = "ok";

  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  const ok = database === "ok";

  return NextResponse.json(
    {
      ok,
      service: "profusta-web",
      database,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
