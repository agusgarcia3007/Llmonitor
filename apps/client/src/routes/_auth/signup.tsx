import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Waitlist } from "@/components/landing/waitlist";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InfoIcon } from "lucide-react";
import type { PlanSlug, BillingPeriod } from "@/types";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormData = z.infer<typeof signupSchema>;

export const Route = createFileRoute("/_auth/signup")({
  component: Signup,
  validateSearch: (search: Record<string, unknown>) => ({
    plan: search.plan as PlanSlug | undefined,
    period: search.period as BillingPeriod | undefined,
  }),
});

function Signup({ className, ...props }: React.ComponentProps<"form">) {
  const { plan, period } = Route.useSearch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignupFormData) {
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: `${window.location.origin}/dashboard?period=1`,
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: async () => {
          if (plan && period) {
            try {
              await authClient.subscription.upgrade({
                plan,
                annual: period === "yearly",
                successUrl: `${window.location.origin}/dashboard`,
                cancelUrl: `${window.location.origin}/pricing`,
              });
              return; // checkout redirection happens
            } catch (err) {
              console.error(err);
            }
          }
          navigate({ to: "/pricing" });
        },
      }
    );
    setLoading(false);
  }

  if (import.meta.env.NODE_ENV !== "production") {
    return (
      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="p-4 bg-blue-500/10 text-blue-600 rounded-full">
              <InfoIcon className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {t("auth.signup.waitlist.title", "Join Our Waitlist")}
              </h1>
              <p className="text-muted-foreground">
                {t(
                  "auth.signup.waitlist.description",
                  "We're currently only accepting registrations through our waitlist. Be the first to access when we open full registration."
                )}
              </p>
            </div>
          </div>
        </Card>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-center">
            {t("auth.signup.waitlist.cardTitle", "Waitlist")}
          </h2>
          <Waitlist />
        </div>

        <div className="text-center text-sm">
          {t("auth.signup.waitlist.hasAccount", "Already have an account?")}{" "}
          <Link to="/login" className="underline underline-offset-4">
            {t("auth.signup.signin", "Sign in")}
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.name", "Name")}</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.email", "Email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="m@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("auth.signup.password", "Password")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            {t("auth.signup.submit", "Sign up")}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t("auth.signup.hasAccount", "Already have an account?")}{" "}
          <Link to="/login" className="underline underline-offset-4">
            {t("auth.signup.signin", "Sign in")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
