import { useEffect, useRef } from "react";

/**
 * Registers a WebMCP tool (https://webmachinelearning.github.io/webmcp/) on
 * `document.modelContext` for as long as the calling component is mounted.
 *
 * `execute` is read through a ref on every call, so the tool always runs with
 * the latest closure (current state, props, etc.) without needing to
 * re-register with the browser whenever those values change. Re-registration
 * only happens if `tool.name` itself changes.
 *
 * No-ops in browsers that don't support WebMCP yet.
 */
export function useWebMcpTool(tool: WebMCP.ModelContextTool | null): void {
  const toolRef = useRef(tool);
  toolRef.current = tool;

  const name = tool?.name;

  useEffect(() => {
    if (typeof document === "undefined" || !document.modelContext || !name) {
      return;
    }

    const controller = new AbortController();

    document.modelContext
      .registerTool(
        {
          name,
          title: toolRef.current?.title,
          description: toolRef.current?.description ?? "",
          inputSchema: toolRef.current?.inputSchema,
          annotations: toolRef.current?.annotations,
          execute: (input, options) => {
            if (!toolRef.current) {
              throw new Error(`WebMCP tool "${name}" is no longer available.`);
            }
            return toolRef.current.execute(input, options);
          },
        },
        { signal: controller.signal },
      )
      .catch((error: unknown) => {
        console.error(`Failed to register WebMCP tool "${name}":`, error);
      });

    return () => controller.abort();
  }, [name]);
}
