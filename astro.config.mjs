// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: cloudflare(),
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
    defaultLocale: "pt",
    locales: ["pt", "en", "de"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});