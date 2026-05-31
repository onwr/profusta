import {
  saveFileFromWebFile,
  StorageConfigError,
} from "@/lib/storage";

async function saveImageFiles(
  files: File[],
  folder: string,
): Promise<string[]> {
  if (files.length === 0) return [];

  const urls: string[] = [];

  for (const file of files) {
    const url = await saveFileFromWebFile(file, folder);
    if (!url) {
      throw new Error("Görsel CDN'e yüklenemedi");
    }
    urls.push(url);
  }

  return urls;
}

export async function saveRequestImages(
  requestId: string,
  files: File[],
): Promise<string[]> {
  return saveImageFiles(files, `profusta/requests/${requestId}`);
}

export async function saveListingImages(
  listingId: string,
  files: File[],
): Promise<string[]> {
  return saveImageFiles(files, `profusta/listings/${listingId}`);
}

export async function saveMessageImage(
  conversationId: string,
  file: File,
): Promise<string> {
  const url = await saveFileFromWebFile(
    file,
    `profusta/messages/${conversationId}`,
  );
  if (!url) {
    throw new Error("Görsel CDN'e yüklenemedi");
  }
  return url;
}

export async function saveUserAvatar(
  userId: string,
  file: File,
): Promise<string> {
  const url = await saveFileFromWebFile(file, `profusta/avatars/${userId}`);
  if (!url) {
    throw new Error("Profil fotoğrafı yüklenemedi");
  }
  return url;
}

export async function saveCategoryCover(
  categoryId: string,
  file: File,
): Promise<string> {
  const url = await saveFileFromWebFile(
    file,
    `profusta/categories/${categoryId}`,
  );
  if (!url) {
    throw new Error("Kapak görseli yüklenemedi");
  }
  return url;
}

export async function saveHomepageAsset(
  file: File,
  kind: "hero" | "mobile",
): Promise<string> {
  const url = await saveFileFromWebFile(
    file,
    `profusta/homepage/${kind}`,
  );
  if (!url) {
    throw new Error("Görsel yüklenemedi");
  }
  return url;
}

export async function saveProviderDocument(
  providerId: string,
  file: File,
  type: string,
): Promise<string> {
  const url = await saveFileFromWebFile(
    file,
    `profusta/providers/${providerId}/documents/${type.toLowerCase()}`,
  );
  if (!url) {
    throw new Error("Belge yüklenemedi");
  }
  return url;
}

export { StorageConfigError };
