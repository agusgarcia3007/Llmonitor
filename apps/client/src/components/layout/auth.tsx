import { Outlet } from "@tanstack/react-router";

export function AuthLayout() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <img
          src="/logo.svg"
          alt="LLMonitor"
          className="w-10 h-10 mx-auto my-4"
        />
        <Outlet />
      </div>
    </div>
  );
}
