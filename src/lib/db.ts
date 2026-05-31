import fs from "node:fs";
import path from "node:path";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const GENERATED_CLIENT_MARKER = path.join(
  process.cwd(),
  "src/generated/prisma/internal/class.ts",
);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientVersion: number | undefined;
};

function getGeneratedClientVersion(): number {
  try {
    return fs.statSync(GENERATED_CLIENT_MARKER).mtimeMs;
  } catch {
    return 0;
  }
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL ortam değişkeni tanımlı değil.");
  }

  const parsed = new URL(url);
  const adapter = new PrismaMariaDb({
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    connectionLimit: 5,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  const version = getGeneratedClientVersion();

  if (
    !globalForPrisma.prisma ||
    globalForPrisma.prismaClientVersion !== version
  ) {
    if (globalForPrisma.prisma) {
      void globalForPrisma.prisma.$disconnect();
    }
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaClientVersion = version;
  }

  return globalForPrisma.prisma;
}

/** Production: tek instance. Dev: `prisma generate` sonrası otomatik yenilenir. */
export const db: PrismaClient =
  process.env.NODE_ENV === "production"
    ? getPrismaClient()
    : new Proxy({} as PrismaClient, {
        get(_target, prop) {
          const client = getPrismaClient();
          const value = Reflect.get(client, prop, client) as unknown;
          if (typeof value === "function") {
            return (value as (...args: unknown[]) => unknown).bind(client);
          }
          return value;
        },
      });
