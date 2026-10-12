import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";

// One row per Netlify Identity user, keyed by the Identity user id.
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  fullName: text("full_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  hostel: text("hostel").notNull().default(""),
  branch: text("branch").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const listings = pgTable(
  "listings",
  {
    id: serial().primaryKey(),
    sellerId: text("seller_id").notNull(),
    sellerName: text("seller_name").notNull().default(""),
    sellerEmail: text("seller_email").notNull().default(""),
    title: text().notNull(),
    description: text().notNull().default(""),
    price: integer().notNull(),
    category: text().notNull(),
    condition: text().notNull(),
    location: text().notNull().default(""),
    imageKey: text("image_key"),
    status: text().notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("listings_seller_idx").on(t.sellerId),
    index("listings_status_created_idx").on(t.status, t.createdAt),
  ],
);
