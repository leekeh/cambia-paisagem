import { env as cloudflareEnv } from "cloudflare:workers";

/**
 * Checks the shared RATE_LIMITER binding for a given route, keyed by client IP.
 * Fails open (allows the request) if the binding isn't configured yet, since
 * rate limiting is defense-in-depth here — Turnstile is the primary bot gate.
 */
export async function checkRateLimit(
  request: Request,
  routeKey: string,
): Promise<boolean> {
  const limiter = cloudflareEnv.RATE_LIMITER;
  if (!limiter) return true;

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const { success } = await limiter.limit({ key: `${routeKey}:${ip}` });
  return success;
}
