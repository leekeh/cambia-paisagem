import { useCallback, useRef, useState } from "react";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  appearance?: "always" | "execute" | "interaction-only";
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptLoadPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Turnstile script"));
      document.head.appendChild(script);
    });
  }
  return scriptLoadPromise;
}

const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Renders a Turnstile widget into the returned `containerRef` element and
 * tracks its token. No-ops (widget never renders, `enabled` is false) if
 * PUBLIC_TURNSTILE_SITE_KEY isn't configured.
 *
 * Uses a callback ref rather than useEffect(..., []) because the container
 * may mount well after this hook's owning component does — e.g. inside a
 * Mantine Modal, which doesn't render its children into the DOM until opened.
 * A callback ref fires exactly when the node actually (dis)appears.
 */
export function useTurnstile() {
  const widgetIdRef = useRef<string | undefined>(undefined);
  const tokenRef = useRef<string | null>(null);
  const mountedNodeRef = useRef<HTMLElement | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = undefined;
      }
      mountedNodeRef.current = null;
      return;
    }

    if (!siteKey) return;
    mountedNodeRef.current = node;

    loadTurnstileScript()
      .then(() => {
        if (mountedNodeRef.current !== node || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(node, {
          sitekey: siteKey,
          appearance: "interaction-only",
          callback: (t) => {
            tokenRef.current = t;
            setToken(t);
          },
          "expired-callback": () => {
            tokenRef.current = null;
            setToken(null);
          },
          "error-callback": () => {
            tokenRef.current = null;
            setToken(null);
          },
        });
      })
      .catch((error: unknown) => {
        console.error("Failed to load Turnstile:", error);
      });
  }, []);

  function reset() {
    tokenRef.current = null;
    setToken(null);
    if (widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current);
    }
  }

  /** Waits (briefly) for a token to resolve, e.g. right after the widget mounts. */
  async function waitForToken(timeoutMs = 8000): Promise<string | null> {
    if (!siteKey) return null;
    const start = Date.now();
    while (!tokenRef.current && Date.now() - start < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return tokenRef.current;
  }

  return { containerRef, token, reset, waitForToken, enabled: Boolean(siteKey) };
}
