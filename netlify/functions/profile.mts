import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { listings, profiles } from "../../db/schema.js";
import { checkOrigin, displayName, error, json, requireUser } from "../lib/http.js";

export default async (req: Request) => {
  const user = await requireUser();
  if (user instanceof Response) return user;

  if (req.method === "GET") {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    return json({
      fullName: profile?.fullName || displayName(user),
      email: user.email ?? "",
      phone: profile?.phone ?? "",
      hostel: profile?.hostel ?? "",
      branch: profile?.branch ?? "",
    });
  }

  if (req.method === "PUT") {
    const blocked = checkOrigin(req);
    if (blocked) return blocked;

    const body = (await req.json()) as Record<string, unknown>;
    const clean = (key: string, max: number) => String(body[key] ?? "").trim().slice(0, max);
    const values = {
      fullName: clean("fullName", 80),
      phone: clean("phone", 20),
      hostel: clean("hostel", 80),
      branch: clean("branch", 80),
    };
    if (values.fullName.length < 2) return error("Please enter your name.", 400);
    if (values.phone && !/^[+\d][\d\s-]{6,19}$/.test(values.phone)) return error("Enter a valid phone number.", 400);

    const [saved] = await db
      .insert(profiles)
      .values({ userId: user.id, ...values })
      .onConflictDoUpdate({ target: profiles.userId, set: { ...values, updatedAt: new Date() } })
      .returning();

    // Keep the name shown on existing listings in sync.
    await db.update(listings).set({ sellerName: values.fullName }).where(eq(listings.sellerId, user.id));

    return json({ ...saved, email: user.email ?? "" });
  }

  return error("Method not allowed.", 405);
};

export const config: Config = {
  path: "/api/profile",
};
