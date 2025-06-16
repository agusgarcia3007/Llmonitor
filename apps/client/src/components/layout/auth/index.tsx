import { Link, Outlet } from "@tanstack/react-router";
import Scene from "./scene";

export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <img
              src="/logo.svg"
              alt="LLMonitor"
              className="w-10 h-10 dark:invert"
            />
            LLMonitor
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block ">
        <Scene />
      </div>
    </div>
  );
}
