// Request checks for /api/contact that run before any validation or email send.
// They are free, need no outside service, and keep the form from being used to flood the inbox
// or use up the Resend sending quota.

/** The JSON body for three short fields fits easily in this. Anything larger is refused unread. */
export const MAX_CONTACT_BODY_BYTES = 16 * 1024;

/** Each visitor may send this many messages per window. */
export const CONTACT_RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

/**
 * A browser always sends Origin on a cross-site POST. When it is present it must match the host the
 * request was sent to, so other sites can't post to the form from a visitor's browser. Requests
 * without Origin (curl, server-side tools) are left to the other checks.
 */
export function isAllowedOrigin(origin: string | null, host: string | null): boolean {
  if (!origin) return true;
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function isJsonContentType(contentType: string | null): boolean {
  return (contentType ?? "").split(";")[0].trim().toLowerCase() === "application/json";
}

/**
 * The visitor's address, used only as an in-memory rate-limit key and never logged.
 * On Vercel the first x-forwarded-for entry is the client address set by the platform.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * A fixed-window counter kept in the function instance's memory. It is best effort: a new instance
 * starts empty, so it slows a single flooding client rather than enforcing a global limit.
 */
export function createRateLimiter({ max, windowMs }: { max: number; windowMs: number }, maxKeys = 5000) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function take(key: string, now = Date.now()): { ok: boolean; retryAfterSeconds: number } {
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (hits.size >= maxKeys) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
        if (hits.size >= maxKeys) hits.delete(hits.keys().next().value as string);
      }
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, retryAfterSeconds: 0 };
    }
    entry.count += 1;
    if (entry.count > max) return { ok: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
    return { ok: true, retryAfterSeconds: 0 };
  };
}
