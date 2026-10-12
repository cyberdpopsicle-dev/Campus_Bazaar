import type { Config, Context } from "@netlify/functions";
import { imageStore } from "../lib/images.js";

export default async (_req: Request, context: Context) => {
  const result = await imageStore().getWithMetadata(context.params.key, { type: "stream" });
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(result.data, {
    headers: {
      "Content-Type": String(result.metadata.contentType ?? "application/octet-stream"),
      // Keys are random UUIDs and never reused, so images can be cached forever.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};

export const config: Config = {
  path: "/api/images/:key",
  method: "GET",
};
