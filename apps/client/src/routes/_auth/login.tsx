import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/_auth/login")({
  component: Login,
});

function Login({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: { email: string; password: string }) {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
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
          navigate({ to: "/dashboard" });
        },
      }
    );
    setLoading(false);
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.signin.title")}</CardTitle>
          <CardDescription>{t("auth.signin.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.signin.email")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="m@example.com"
                          type="email"
                          {...field}
                        />
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
                      <div className="flex items-center">
                        <FormLabel>{t("auth.signin.password")}</FormLabel>
                        <a
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          {t("auth.signin.forgot")}
                        </a>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" isLoading={loading}>
                    {t("auth.signin.submit")}
                  </Button>
                  <Button variant="outline" className="w-full">
                    {t("auth.signin.google")}
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                {t("auth.signin.noAccount")}{" "}
                <Link to="/signup" className="underline underline-offset-4">
                  {t("auth.signin.signup")}
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
