import { DashboardLayout } from "@/components/layout/dashboard/indext";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});
