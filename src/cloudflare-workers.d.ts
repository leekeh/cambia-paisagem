declare module "cloudflare:workers" {
  export const env: {
    RESEND_API_KEY: string;
    FROM_EMAIL: string;
    CONTACT_EMAIL: string;
    [key: string]: string | undefined;
  };
}
