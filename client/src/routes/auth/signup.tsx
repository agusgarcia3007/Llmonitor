import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/signup")({
  component: Signup,
});

function Signup() {
  return <>signup</>;
}
