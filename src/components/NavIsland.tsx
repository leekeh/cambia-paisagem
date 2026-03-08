import { Drawer, Burger, Stack, Anchor, Menu, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import styles from "./NavIsland.module.css";
import MantineProvider from "./MantineProvider";

interface LangOption {
  code: string;
  label: string;
  flag: string;
  href: string;
}

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  links: NavLink[];
  langOptions: LangOption[];
  currentLang: string;
  langLabel: string;
  toggleNavigationLabel: string;
  currentPath: string;
}

export default function NavIsland(props: Props) {
  return (
    <MantineProvider>
      <NavIslandInner {...props} />
    </MantineProvider>
  );
}

function NavIslandInner({
  links,
  langOptions,
  currentLang,
  toggleNavigationLabel,
  langLabel,
  currentPath,
}: Props) {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const currentLangInfo = langOptions.find((l) => l.code === currentLang);

  return (
    <>
      {/* Language dropdown — shown on desktop */}
      <div className={styles.langMenu}>
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <button className={styles.langTrigger} aria-label={langLabel}>
              <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>
                {currentLangInfo?.flag}
              </span>
              <span className={styles.langTriggerLabel}>
                {currentLangInfo?.label}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </Menu.Target>
          <Menu.Dropdown>
            {langOptions.map((opt) => (
              <Menu.Item
                key={opt.code}
                component="a"
                aria-selected={opt.code === currentLang ? "true" : undefined}
                href={opt.href}
                leftSection={
                  <span style={{ fontSize: "1.2rem" }}>{opt.flag}</span>
                }
                fw={opt.code === currentLang ? 600 : 400}
              >
                {opt.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </div>

      {/* Hamburger — shown on mobile */}
      <div className={styles.burger}>
        <Burger
          opened={drawerOpened}
          onClick={toggleDrawer}
          size="sm"
          aria-label={toggleNavigationLabel}
        />
      </div>

      {/* Mobile drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={
          <span
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "1.25rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            CambiaPaisagem
          </span>
        }
        padding="xl"
        size="xs"
        position="right"
      >
        <Stack gap="lg" mt="md">
          {links.map((link) => (
            <Anchor
              key={link.href}
              href={link.href}
              aria-current={
                currentPath.startsWith(link.href) ? "page" : undefined
              }
              onClick={closeDrawer}
              style={{
                fontSize: "1.1rem",
                color: "var(--color-text)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {link.label}
            </Anchor>
          ))}

          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "1rem",
              marginTop: "0.5rem",
            }}
          >
            <Text size="xs" c="dimmed" mb="sm" tt="uppercase" fw={600} lts={1}>
              {langLabel}
            </Text>
            <Stack gap="xs">
              {langOptions.map((opt) => (
                <Anchor
                  key={opt.code}
                  href={opt.href}
                  onClick={closeDrawer}
                  aria-current={opt.code === currentLang ? "true" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--color-text)",
                    textDecoration: "none",
                    fontWeight: opt.code === currentLang ? 700 : 400,
                    opacity: opt.code === currentLang ? 1 : 0.65,
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{opt.flag}</span>
                  {opt.label}
                </Anchor>
              ))}
            </Stack>
          </div>
        </Stack>
      </Drawer>
    </>
  );
}
