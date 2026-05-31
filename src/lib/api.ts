import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { StorageConfigError } from "@/lib/storage";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonSuccess<T extends Record<string, unknown>>(
  data: T,
  status = 200,
) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof StorageConfigError) {
    return jsonError(error.message, 503);
  }
  if (error instanceof ZodError) {
    const first = error.issues[0]?.message ?? "Geçersiz veri";
    return jsonError(first, 400);
  }
  console.error("[api]", error);
  return jsonError("Sunucu hatası", 500);
}
