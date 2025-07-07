import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { IconBrandGithub } from "@tabler/icons-react";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_auth/signup")({
  component: Signup,
});

function Signup({ className, ...props }: React.ComponentProps<"form">) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await authClient.signUp.email(
      {
        email,
        password,
        name,
        callbackURL: "https://llmonitor.io/dashboard",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          navigate({ to: "/dashboard", search: { period: "1" } });
        },
      }
    );
    setLoading(false);
  }

  async function handleGithubSignup() {
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
          {t("auth.signup.title", "Create your account")}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t(
            "auth.signup.description",
            "Enter your details below to create your account"
          )}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">{t("auth.signup.name", "Name")}</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">{t("auth.signup.email", "Email")}</Label>
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
              {t("auth.signup.password", "Password")}
            </Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {t("auth.signup.forgot", "Forgot your password?")}
            </a>
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
          {t("auth.signup.submit", "Sign up")}
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t("auth.signup.or", "Or")}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGithubSignup}
          isLoading={githubLoading}
        >
          <IconBrandGithub className="size-4" />
          {t("auth.signup.github", "Sign up with GitHub")}
        </Button>
      </div>
      <div className="text-center text-sm">
        {t("auth.signup.hasAccount", "Already have an account?")}{" "}
        <Link to="/login" className="underline underline-offset-4">
          {t("auth.signup.signin", "Sign in")}
        </Link>
      </div>
    </form>
  );
}
