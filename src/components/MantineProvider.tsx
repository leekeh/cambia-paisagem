import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import type { ReactNode } from "react";

const theme = createTheme({
  primaryColor: "dark",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  headings: { fontFamily: "Cormorant Garamond, Georgia, serif" },
  radius: { md: "12px" },
  colors: {
    // override primary dark shades to match brand
    dark: [
      "#C1BDB8",
      "#A8A4A0",
      "#8E8A86",
      "#75716D",
      "#5C5854",
      "#43403C",
      "#2A2824",
      "#1A1A1A",
      "#111110",
      "#0A0A09",
    ],
  },
});

export default function AppMantineProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
