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
import { IconBrandGithub, IconBrandGoogleFilled } from "@tabler/icons-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_auth/signup")({
  component: Signup,
});

function Signup({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation();
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: {
    name: string;
    email: string;
    password: string;
  }) {
    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
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
          <CardTitle>{t("auth.signup.title")}</CardTitle>
          <CardDescription>{t("auth.signup.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.signup.name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                      <FormLabel>{t("auth.signup.email")}</FormLabel>
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
                        <FormLabel>{t("auth.signup.password")}</FormLabel>
                        <a
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          {t("auth.signup.forgot")}
                        </a>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full" isLoading={loading}>
                    {t("auth.signup.submit")}
                  </Button>
                  <span className="relative text-center text-sm">
                    <hr className="my-2" />
                    <p className="text-muted-foreground text-xs bg-white px-2 absolute left-1/2 -translate-x-1/2 top-0">
                      {t("auth.signin.or")}
                    </p>
                  </span>
                  <div className="flex gap-x-2 items-center justify-center">
                    <Button variant="outline" size="icon">
                      <IconBrandGoogleFilled />
                    </Button>
                    <Button variant="outline" size="icon">
                      <IconBrandGithub />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                {t("auth.signup.hasAccount")}{" "}
                <Link to="/login" className="underline underline-offset-4">
                  {t("auth.signup.signin")}
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
