import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { and, desc, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { listings, profiles } from "../../db/schema.js";
import { CATEGORIES, CONDITIONS, checkOrigin, displayName, error, json, requireUser } from "../lib/http.js";
import { imageStore, saveImage, validateImage } from "../lib/images.js";

type Fields = {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
};

function parseFields(form: FormData): Fields | string {
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const price = Number(form.get("price"));
  const category = String(form.get("category") ?? "");
  const condition = String(form.get("condition") ?? "");
  const location = String(form.get("location") ?? "").trim();

  if (title.length < 3 || title.length > 100) return "Title must be between 3 and 100 characters.";
  if (description.length > 2000) return "Description must be 2000 characters or fewer.";
  if (!Number.isInteger(price) || price < 0 || price > 10_000_000) return "Price must be a whole number of rupees.";
  if (!(CATEGORIES as readonly string[]).includes(category)) return "Choose a valid category.";
  if (!(CONDITIONS as readonly string[]).includes(condition)) return "Choose a valid condition.";
  if (location.length > 100) return "Pickup location must be 100 characters or fewer.";
  return { title, description, price, category, condition, location };
}

async function list(req: Request) {
  const params = new URL(req.url).searchParams;
  const q = params.get("q")?.trim();
  const category = params.get("category");
  const sort = params.get("sort");

  const filters = [eq(listings.status, "active")];
  if (q) filters.push(or(ilike(listings.title, `%${q}%`), ilike(listings.description, `%${q}%`))!);
  if (category && (CATEGORIES as readonly string[]).includes(category)) filters.push(eq(listings.category, category));

  const order =
    sort === "price_asc" ? asc(listings.price) : sort === "price_desc" ? desc(listings.price) : desc(listings.createdAt);

  const rows = await db
    .select()
    .from(listings)
    .where(and(...filters))
    .orderBy(order)
    .limit(120);
  return json(rows.map(({ sellerEmail, ...rest }) => rest));
}

async function getOne(id: number) {
  const [row] = await db
    .select({ listing: listings, phone: profiles.phone, hostel: profiles.hostel })
    .from(listings)
    .leftJoin(profiles, eq(profiles.userId, listings.sellerId))
    .where(eq(listings.id, id));
  if (!row) return error("Listing not found.", 404);

  // Contact details are only shared with signed-in students.
  const viewer = await getUser();
  const { sellerEmail, ...listing } = row.listing;
  return json({
    ...listing,
    isOwner: viewer?.id === listing.sellerId,
    contact: viewer ? { email: sellerEmail, phone: row.phone ?? "", hostel: row.hostel ?? "" } : null,
  });
}

async function create(req: Request) {
  const user = await requireUser();
  if (user instanceof Response) return user;

  const form = await req.formData();
  const fields = parseFields(form);
  if (typeof fields === "string") return error(fields, 400);

  let imageKey: string | null = null;
  const image = form.get("image");
  if (image instanceof File && image.size > 0) {
    const problem = validateImage(image);
    if (problem) return error(problem, 400);
    imageKey = await saveImage(image);
  }

  const [created] = await db
    .insert(listings)
    .values({
      ...fields,
      imageKey,
      sellerId: user.id,
      sellerName: displayName(user),
      sellerEmail: user.email ?? "",
    })
    .returning();
  return json(created, 201);
}

async function update(req: Request, id: number) {
  const user = await requireUser();
  if (user instanceof Response) return user;

  const [existing] = await db.select().from(listings).where(eq(listings.id, id));
  if (!existing) return error("Listing not found.", 404);
  if (existing.sellerId !== user.id) return error("You can only edit your own listings.", 403);

  const { status } = (await req.json()) as { status?: string };
  if (status !== "active" && status !== "sold") return error("Status must be active or sold.", 400);

  const [updated] = await db
    .update(listings)
    .set({ status, updatedAt: new Date() })
    .where(eq(listings.id, id))
    .returning();
  return json(updated);
}

async function remove(id: number) {
  const user = await requireUser();
  if (user instanceof Response) return user;

  const [existing] = await db.select().from(listings).where(eq(listings.id, id));
  if (!existing) return error("Listing not found.", 404);
  if (existing.sellerId !== user.id) return error("You can only delete your own listings.", 403);

  await db.delete(listings).where(eq(listings.id, id));
  if (existing.imageKey) await imageStore().delete(existing.imageKey);
  return new Response(null, { status: 204 });
}

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    const blocked = checkOrigin(req);
    if (blocked) return blocked;
  }

  if (!context.params.id) {
    if (req.method === "GET") return list(req);
    if (req.method === "POST") return create(req);
    return error("Method not allowed.", 405);
  }

  const id = Number(context.params.id);
  if (!Number.isInteger(id) || id <= 0) return error("Listing not found.", 404);
  if (req.method === "GET") return getOne(id);
  if (req.method === "PATCH") return update(req, id);
  if (req.method === "DELETE") return remove(id);
  return error("Method not allowed.", 405);
};

export const config: Config = {
  path: ["/api/listings", "/api/listings/:id"],
};
