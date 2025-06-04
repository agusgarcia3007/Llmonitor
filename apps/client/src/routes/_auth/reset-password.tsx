import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import {
  createFileRoute,
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const createResetPasswordSchema = (
  t: (key: string, fallback: string) => string
) =>
  z
    .object({
      newPassword: z
        .string()
        .min(
          8,
          t(
            "auth.resetPassword.passwordTooShort",
            "Password must be at least 8 characters long"
          )
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t(
        "auth.resetPassword.passwordsDoNotMatch",
        "Passwords do not match"
      ),
      path: ["confirmPassword"],
    });

type ResetPasswordFormData = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;

type SearchParams = {
  token?: string;
  error?: string;
};

export const Route = createFileRoute("/_auth/reset-password")({
  component: ResetPassword,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      token: (search.token as string) || undefined,
      error: (search.error as string) || undefined,
    };
  },
});

function ResetPassword({ className }: { className?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_auth/reset-password" });
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const resetPasswordSchema = createResetPasswordSchema(t);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (search.error === "invalid_token") {
      setTokenValid(false);
      toast.error(
        t("auth.resetPassword.invalidToken", "Invalid or expired reset token")
      );
    }
  }, [search.error, t]);

  async function onSubmit(data: ResetPasswordFormData) {
    if (!search.token) {
      toast.error(
        t("auth.resetPassword.tokenRequired", "Reset token is required")
      );
      return;
    }

    setLoading(true);

    try {
      await authClient.resetPassword({
        newPassword: data.newPassword,
        token: search.token,
      });

      toast.success(
        t("auth.resetPassword.resetSuccess", "Password reset successfully")
      );
      navigate({ to: "/login" });
    } catch {
      toast.error(
        t("auth.resetPassword.resetError", "Failed to reset password")
      );
    } finally {
      setLoading(false);
    }
  }

  if (!search.token || !tokenValid) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">
            {t("auth.resetPassword.invalidLink", "Invalid Reset Link")}
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t(
              "auth.resetPassword.invalidLinkDescription",
              "The reset link is invalid or has expired. Please request a new one."
            )}
          </p>
        </div>
        <div className="grid gap-6">
          <Button asChild className="w-full">
            <Link to="/forgot-password">
              {t("auth.resetPassword.requestNewLink", "Request new reset link")}
            </Link>
          </Button>
        </div>
        <div className="text-center text-sm">
          <Link to="/login" className="underline underline-offset-4">
            {t("auth.forgotPassword.backToLogin", "Back to login")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">
            {t("auth.resetPassword.title", "Reset your password")}
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t(
              "auth.resetPassword.description",
              "Enter your new password below"
            )}
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("auth.resetPassword.newPassword", "New Password")}
                </FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("auth.resetPassword.confirmPassword", "Confirm Password")}
                </FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            {t("auth.resetPassword.submit", "Reset Password")}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t("auth.resetPassword.remember", "Remember your password?")}{" "}
          <Link to="/login" className="underline underline-offset-4">
            {t("auth.resetPassword.signin", "Sign in")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
