import { createFileRoute } from "@tanstack/react-router";
import { LandingLayout } from "@/components/layout/landing";

export const Route = createFileRoute("/_landing")({
  component: LandingLayout,
});
