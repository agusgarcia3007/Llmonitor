import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_auth/login")({
  component: Login,
});

function Login({ className, ...props }: React.ComponentProps<"form">) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          const expires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toUTCString();
          document.cookie = `isAuthenticated=true; expires=${expires}; path=/;`;
          navigate({ to: "/dashboard", search: { period: "1" } });
        },
      }
    );
    setLoading(false);
  }

  async function handleGithubLogin() {
    setGithubLoading(true);
    await authClient.signIn.social(
      {
        provider: "github",
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          setGithubLoading(true);
        },
        onSuccess: () => {
          const expires = new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toUTCString();
          document.cookie = `isAuthenticated=true; expires=${expires}; path=/;`;
          navigate({ to: "/dashboard", search: { period: "1" } });
        },
      }
    );
    setGithubLoading(false);
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {t("auth.signin.title", "Login to your account")}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t(
            "auth.signin.description",
            "Enter your email below to login to your account"
          )}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{t("auth.signin.email", "Email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">
              {t("auth.signin.password", "Password")}
            </Label>
            <Link
              to="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {t("auth.signin.forgot", "Forgot your password?")}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" isLoading={loading}>
          {t("auth.signin.submit", "Login")}
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("auth.signin.or", "Or")}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGithubLogin}
          isLoading={githubLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          {t("auth.signin.github", "Login with GitHub")}
        </Button>
      </div>
      <div className="text-center text-sm">
        {t("auth.signin.noAccount", "Don't have an account?")}{" "}
        <Link to="/signup" className="underline underline-offset-4">
          {t("auth.signin.signup", "Sign up")}
        </Link>
      </div>
    </form>
  );
}
