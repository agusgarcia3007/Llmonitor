import { AuthLayout } from "@/components/layout/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AuthLayout />;
}
