import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <span className="size-6 rounded-full bg-gradient-to-br from-fd-primary to-fd-secondary" />
        LLMonitor
      </>
    ),
    url: "/",
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [
    {
      text: "Documentation",
      url: "/docs",
      active: "nested-url",
    },
    {
      text: "Dashboard",
      url: "https://llmonitor.ai",
      external: true,
    },
    {
      text: "GitHub",
      url: "https://github.com/agusgarcia3007/Llmonitor",
      external: true,
    },
  ],
  githubUrl: "https://github.com/agusgarcia3007/Llmonitor",
};
