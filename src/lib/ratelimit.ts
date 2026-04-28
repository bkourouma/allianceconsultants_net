const WINDOW_MS = 10 * 60 * 1000;

const buckets = new Map<string, number[]>();

/**
 * In-memory sliding-window rate limiter, keyed by `bucket:identifier`.
 * Suffisant pour un déploiement mono-instance (cas Alliance MVP).
 * Pour multi-instance, à remplacer par Redis ultérieurement.
 */
export function consumeRateLimit({
  bucket,
  identifier,
  max,
  windowMs = WINDOW_MS,
}: {
  bucket: string;
  identifier: string;
  max: number;
  windowMs?: number;
}): { allowed: boolean; remaining: number } {
  const key = `${bucket}:${identifier}`;
  const now = Date.now();
  const cutoff = now - windowMs;
  const past = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (past.length >= max) {
    buckets.set(key, past);
    return { allowed: false, remaining: 0 };
  }
  past.push(now);
  buckets.set(key, past);
  return { allowed: true, remaining: Math.max(0, max - past.length) };
}

export function getClientIpFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
