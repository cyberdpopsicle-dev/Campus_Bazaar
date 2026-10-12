import { getStore } from "@netlify/blobs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

export const imageStore = () => getStore("listing-images");

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Photo must be a JPEG, PNG, WebP or GIF image.";
  if (file.size > MAX_BYTES) return "Photo must be 5 MB or smaller.";
  return null;
}

export async function saveImage(file: File): Promise<string> {
  const ext = file.type.split("/")[1];
  const key = `${crypto.randomUUID()}.${ext}`;
  await imageStore().set(key, await file.arrayBuffer(), { metadata: { contentType: file.type } });
  return key;
}
