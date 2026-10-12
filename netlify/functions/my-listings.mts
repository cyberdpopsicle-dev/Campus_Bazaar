import type { Config } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { listings } from "../../db/schema.js";
import { error, json, requireUser } from "../lib/http.js";

export default async (req: Request) => {
  if (req.method !== "GET") return error("Method not allowed.", 405);
  const user = await requireUser();
  if (user instanceof Response) return user;

  const rows = await db
    .select()
    .from(listings)
    .where(eq(listings.sellerId, user.id))
    .orderBy(desc(listings.createdAt));
  return json(rows);
};

export const config: Config = {
  path: "/api/my-listings",
};
