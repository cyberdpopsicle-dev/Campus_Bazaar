import { getUser, verifyRequestOrigin } from "@netlify/identity";
import type { User } from "@netlify/identity";

export const CATEGORIES = [
  "Books & Notes",
  "Electronics",
  "Hostel Essentials",
  "Cycles & Transport",
  "Clothing",
  "Sports & Fitness",
  "Stationery",
  "Other",
] as const;

export const CONDITIONS = ["New", "Like New", "Good", "Fair"] as const;

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

export const error = (message: string, status: number) => json({ error: message }, status);

export async function requireUser(): Promise<User | Response> {
  const user = await getUser();
  return user ?? error("Please sign in to continue.", 401);
}

// Rejects state-changing requests that don't come from this site.
export function checkOrigin(req: Request): Response | null {
  try {
    verifyRequestOrigin(req);
    return null;
  } catch {
    return error("Request origin not allowed.", 403);
  }
}

export function displayName(user: User): string {
  const meta = user.userMetadata as { full_name?: string } | undefined;
  return meta?.full_name || user.name || user.email?.split("@")[0] || "Student";
}
