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

import { createFileRoute, Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const createForgotPasswordSchema = (
  t: (key: string, fallback: string) => string
) =>
  z.object({
    email: z
      .string()
      .email(
        t(
          "auth.forgotPassword.invalidEmail",
          "Please enter a valid email address"
        )
      ),
  });

type ForgotPasswordFormData = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;

export const Route = createFileRoute("/_auth/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const forgotPasswordSchema = createForgotPasswordSchema(t);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true);

    try {
      await authClient.forgetPassword({
        email: data.email,
        redirectTo: "/reset-password",
      });

      setEmailSent(true);
      toast.success(
        t(
          "auth.forgotPassword.emailSentSuccess",
          "Reset password email sent successfully"
        )
      );
    } catch {
      toast.error(
        t(
          "auth.forgotPassword.emailSentError",
          "Failed to send reset password email"
        )
      );
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">
            {t("auth.forgotPassword.checkEmail", "Check your email")}
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t(
              "auth.forgotPassword.emailSent",
              "We've sent a password reset link to"
            )}{" "}
            <strong>{form.getValues("email")}</strong>
          </p>
        </div>
        <div className="grid gap-6">
          <p className="text-sm text-muted-foreground text-center">
            {t(
              "auth.forgotPassword.emailNotReceived",
              "Didn't receive the email? Check your spam folder or try again."
            )}
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setEmailSent(false)}
          >
            {t("auth.forgotPassword.tryAgain", "Try again")}
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
            {t("auth.forgotPassword.title", "Forgot your password?")}
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t(
              "auth.forgotPassword.description",
              "Enter your email address and we'll send you a link to reset your password"
            )}
          </p>
        </div>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signin.email", "Email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="m@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            {t("auth.forgotPassword.submit", "Send reset link")}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t("auth.forgotPassword.remember", "Remember your password?")}{" "}
          <Link to="/login" className="underline underline-offset-4">
            {t("auth.forgotPassword.signin", "Sign in")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
