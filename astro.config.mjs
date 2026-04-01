// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://www.cambiatours.com",
  output: "static",
  adapter: cloudflare({ imageService: "compile" }),
  devToolbar: { enabled: false },
  integrations: [react()],
  vite: {
    optimizeDeps: {
      include: [
        "@mantine/core",
        "@mantine/dates",
        "@mantine/form",
        "@mantine/hooks",
        "dayjs",
        "dayjs/locale/pt",
        "dayjs/locale/de",
      ],
    },
  },
  i18n: {
    defaultLocale: "en",
    locales: ["pt", "en", "de"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
});
