interface ImportMetaEnv {
  /** Cloudflare Turnstile site key (public, safe to ship in the client bundle). */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
