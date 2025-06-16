import { Outlet } from "@tanstack/react-router";
import { HeroHeader } from "@/components/landing/header";
import { ThemeSwitch } from "@/components/layout/theme-switch";
import { LanguageSwitch } from "@/components/layout/language-switch";

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex flex-col justify-start">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <LanguageSwitch />
        <ThemeSwitch />
      </div>
      <HeroHeader />
      <div className="pt-24">
        <Outlet />
      </div>
    </div>
  );
}
