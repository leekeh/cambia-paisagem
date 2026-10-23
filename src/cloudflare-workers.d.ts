declare module "cloudflare:workers" {
  export const env: {
    RESEND_API_KEY: string;
    FROM_EMAIL: string;
    CONTACT_EMAIL: string;
    TURNSTILE_SECRET_KEY: string;
    /** Declared in wrangler.jsonc; not yet addable from the Cloudflare dashboard. */
    RATE_LIMITER?: {
      limit(options: { key: string }): Promise<{ success: boolean }>;
    };
  };
}
