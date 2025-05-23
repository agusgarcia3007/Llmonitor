import {
  IconDashboard,
  IconFileDescription,
  IconCurrency,
  IconBell,
  IconSettings,
  IconHelp,
  IconInnerShadowTop,
  IconFlask,
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/layout/dashboard/nav-main";
import { NavSecondary } from "@/components/layout/dashboard/nav-secondary";
import { NavUser } from "@/components/layout/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Logs",
      url: "/logs",
      icon: IconFileDescription,
    },
    {
      title: "Cost Analysis",
      url: "/cost-analysis",
      icon: IconCurrency,
    },
    {
      title: "Alerts",
      url: "/alerts",
      icon: IconBell,
    },
    {
      title: "Experiments",
      url: "/experiments",
      icon: IconFlask,
      isComingSoon: true,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Documentation",
      url: "/docs",
      icon: IconHelp,
      external: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user
    ? {
        name: session.user.name || session.user.email,
        email: session.user.email,
        avatar: session.user.image || "",
      }
    : null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">LLMonitor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {isPending ? (
          <div className="p-4 text-xs text-muted-foreground">
            Loading user...
          </div>
        ) : user ? (
          <NavUser user={user} />
        ) : (
          <div className="p-4 text-xs text-muted-foreground">Not signed in</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
