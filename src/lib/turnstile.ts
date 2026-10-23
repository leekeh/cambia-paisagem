import { env as cloudflareEnv } from "cloudflare:workers";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

/**
 * Verifies a Turnstile token server-side. Fails closed: if TURNSTILE_SECRET_KEY
 * isn't configured yet, verification fails rather than silently passing, so a
 * missing console setup step is loud (forms stop accepting submissions) rather
 * than a silent security gap.
 */
export async function verifyTurnstileToken(
  token: unknown,
  request: Request,
): Promise<boolean> {
  const secret = cloudflareEnv.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error(
      "TURNSTILE_SECRET_KEY is not configured; rejecting submission.",
    );
    return false;
  }

  if (typeof token !== "string" || !token) return false;

  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) body.append("remoteip", ip);

  const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
  if (!res.ok) return false;

  const outcome = (await res.json()) as SiteverifyResponse;
  return outcome.success === true;
}
