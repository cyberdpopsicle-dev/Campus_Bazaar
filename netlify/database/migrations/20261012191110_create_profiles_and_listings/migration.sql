CREATE TABLE "listings" (
	"id" serial PRIMARY KEY,
	"seller_id" text NOT NULL,
	"seller_name" text DEFAULT '' NOT NULL,
	"seller_email" text DEFAULT '' NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"category" text NOT NULL,
	"condition" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"image_key" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY,
	"full_name" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"hostel" text DEFAULT '' NOT NULL,
	"branch" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "listings_seller_idx" ON "listings" ("seller_id");--> statement-breakpoint
CREATE INDEX "listings_status_created_idx" ON "listings" ("status","created_at");