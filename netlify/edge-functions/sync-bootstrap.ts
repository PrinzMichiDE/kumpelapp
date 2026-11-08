import type { Config, Context } from "@netlify/edge-functions"

async function createEtag(value: unknown): Promise<string> {
  const body = JSON.stringify(value)
  const bytes = new TextEncoder().encode(body)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32)
  return `"${hash}"`
}

export default async (request: Request, context: Context) => {
  // Only handle GET requests to sync bootstrap
  if (request.method !== "GET" || !request.url.includes("/api/v1/sync/bootstrap")) {
    return context.next()
  }

  const url = new URL(request.url)
  const ifNoneMatch = request.headers.get("if-none-match")

  try {
    // Check if we have a cached response in KV
    const cacheKey = `sync-bundle-${url.search}`
    const cached = await context.kv.get(cacheKey, { type: "json" })

    if (cached) {
      const etag = typeof cached.etag === "string" ? cached.etag : await createEtag(cached.data)

      if (ifNoneMatch === etag) {
        return new Response(null, { status: 304 })
      }

      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ETag: etag,
          "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
        },
      })
    }

    // Not in cache, fetch from origin
    const response = await context.next()

    if (response.ok) {
      const data = await response.json()
      const etag = await createEtag(data)

      // Store in KV for 1 hour
      await context.kv.set(cacheKey, { data, etag }, { expirationTtl: 3600 })

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ETag: etag,
          "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
        },
      })
    }

    return response
  } catch (error) {
    console.error("Edge function error:", error)
    return context.next()
  }
}

export const config: Config = {
  path: "/api/v1/sync/bootstrap*",
}
