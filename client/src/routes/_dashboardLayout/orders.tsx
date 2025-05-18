import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboardLayout/orders")({
  component: Orders,
});

function Orders() {
  return <>orders</>;
}
