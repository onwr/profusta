import { DocumentType, UserRole } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { getCentroid } from "@/lib/geo/turkey";
import { assertServiceAreaEnabled } from "@/lib/settings/service-areas";
import { providerRegisterSchema } from "@/lib/validations/auth";
import { toSlug } from "@/lib/slug";
import { createUniqueProviderSlug } from "@/lib/providers/slug";
import { saveProviderDocument, StorageConfigError } from "@/lib/upload";

const DOCUMENT_FIELDS: { field: string; type: DocumentType }[] = [
  { field: "idCard", type: DocumentType.ID_CARD },
  { field: "tradeLicense", type: DocumentType.TRADE_LICENSE },
  { field: "certificate", type: DocumentType.CERTIFICATE },
];

async function parseProviderRegisterRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const rawData = form.get("data");
    if (typeof rawData !== "string") {
      throw new Error("Geçersiz form verisi");
    }

    const data = providerRegisterSchema.parse(JSON.parse(rawData));
    const files = new Map<DocumentType, File>();

    for (const { field, type } of DOCUMENT_FIELDS) {
      const file = form.get(field);
      if (file instanceof File && file.size > 0) {
        files.set(type, file);
      }
    }

    return { data, files };
  }

  const data = providerRegisterSchema.parse(await request.json());
  return { data, files: new Map<DocumentType, File>() };
}

async function saveProviderDocuments(
  providerId: string,
  files: Map<DocumentType, File>,
) {
  const saved: DocumentType[] = [];
  const errors: string[] = [];

  for (const [type, file] of files.entries()) {
    try {
      const fileUrl = await saveProviderDocument(providerId, file, type);
      await db.providerDocument.create({
        data: {
          providerId,
          type,
          fileUrl,
          fileName: file.name,
        },
      });
      saved.push(type);
    } catch (err) {
      errors.push(
        err instanceof Error ? err.message : "Belge yüklenemedi",
      );
    }
  }

  return { saved, errors };
}

export async function POST(request: Request) {
  try {
    const { data, files } = await parseProviderRegisterRequest(request);

    const areaCheck = await assertServiceAreaEnabled(
      data.baseCity,
      data.baseDistrict,
    );
    if (!areaCheck.ok) {
      return jsonError(areaCheck.message, 400);
    }

    const centroid = getCentroid(data.baseCity, data.baseDistrict);

    const email = data.email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("Bu e-posta adresi zaten kayıtlı", 409);
    }

    const providerSlug = await createUniqueProviderSlug(db, data.fullName);

    const user = await db.user.create({
      data: {
        email,
        passwordHash: await hashPassword(data.password),
        fullName: data.fullName.trim(),
        phone: data.phone?.trim(),
        role: UserRole.PROVIDER,
        provider: {
          create: {
            slug: providerSlug,
            bio: data.bio?.trim(),
            iban: data.iban?.trim(),
            baseCity: data.baseCity,
            baseDistrict: data.baseDistrict,
            baseLatitude: centroid?.lat ?? null,
            baseLongitude: centroid?.lng ?? null,
            serviceRadiusKm: data.serviceRadiusKm,
            categories: {
              create: data.categories.map((c) => ({
                categorySlug: toSlug(c),
              })),
            },
            serviceAreas: {
              create: data.serviceAreas.map((area) => ({
                city: area.city,
                district: area.district,
              })),
            },
          },
        },
      },
      include: { provider: true },
    });

    let documentNote: string | undefined;
    if (files.size > 0 && user.provider) {
      const { saved, errors } = await saveProviderDocuments(
        user.provider.id,
        files,
      );
      if (saved.length > 0 && errors.length === 0) {
        documentNote = `${saved.length} belge yüklendi.`;
      } else if (saved.length > 0) {
        documentNote = `${saved.length} belge yüklendi; bazı belgeler yüklenemedi.`;
      } else if (errors.length > 0) {
        documentNote =
          "Başvuru alındı ancak belgeler yüklenemedi. CDN yapılandırmasını kontrol edin.";
      }
    }

    return jsonSuccess(
      {
        message: documentNote
          ? `Başvurunuz alındı. ${documentNote} Admin onayından sonra hesabınız aktif olacaktır.`
          : "Başvurunuz alındı. Admin onayından sonra hesabınız aktif olacaktır.",
        redirect: "/giris?applied=1",
        userId: user.id,
      },
      201,
    );
  } catch (error) {
    if (error instanceof StorageConfigError) {
      return jsonError(error.message, 503);
    }
    return handleApiError(error);
  }
}
