"use client";

import { type Icon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    isComingSoon?: boolean;
  }[];
}) {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              currentPath === item.url ||
              (item.url !== "/" && currentPath.startsWith(item.url));

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild={!item.isComingSoon}
                  tooltip={
                    item.isComingSoon
                      ? `${item.title} (Coming Soon)`
                      : item.title
                  }
                  className={cn(
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                    item.isComingSoon && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {item.isComingSoon ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Soon
                      </Badge>
                    </div>
                  ) : (
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
