import { Outlet } from "@tanstack/react-router";
import { HeroHeader } from "@/components/landing/header";

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex flex-col justify-start">
      <HeroHeader />
      <div className="pt-24">
        <Outlet />
      </div>
    </div>
  );
}
