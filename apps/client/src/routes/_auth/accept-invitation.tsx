import {
  IconBriefcase,
  IconCheck,
  IconMail,
  IconUsers,
  IconX,
  IconLoader,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  useAcceptInvitation,
  useRejectInvitation,
} from "@/services/organizations/mutations";
import { useGetInvitationByToken } from "@/services/organizations/query";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignupFormData = z.infer<typeof signupSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/_auth/accept-invitation")({
  component: AcceptInvitationPage,
  validateSearch: z.object({
    token: z.string().optional(),
  }),
});

function AcceptInvitationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/_auth/accept-invitation" });
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: invitation,
    isLoading: isLoadingInvitation,
    error: invitationError,
  } = useGetInvitationByToken(token || "");

  const { mutateAsync: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation();
  const { mutateAsync: rejectInvitation, isPending: isRejecting } =
    useRejectInvitation();

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: invitation?.email || "",
      password: "",
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: invitation?.email || "",
      password: "",
    },
  });

  useEffect(() => {
    if (invitation?.email) {
      signupForm.setValue("email", invitation.email);
      loginForm.setValue("email", invitation.email);
    }
  }, [invitation?.email, signupForm, loginForm]);

  useEffect(() => {
    if (user && invitation && !authMode) {
      if (user.email === invitation.email) {
        return;
      }
      toast.error(
        t("invitations.wrongAccount", {
          invitedEmail: invitation.email,
          currentEmail: user.email,
        })
      );
    }
  }, [user, invitation, authMode, t]);

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    try {
      setIsProcessing(true);
      await acceptInvitation(invitation.id);
      toast.success(t("invitations.acceptedSuccessfully"));
      navigate({ to: "/projects" });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error(t("invitations.acceptError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectInvitation = async () => {
    if (!invitation) return;

    try {
      setIsProcessing(true);
      await rejectInvitation(invitation.id);
      toast.success(t("invitations.rejectedSuccessfully"));
      navigate({ to: "/" });
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      toast.error(t("invitations.rejectError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    try {
      setIsProcessing(true);
      await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success(t("auth.signupSuccess"));
      setAuthMode(null);
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(t("auth.signupError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsProcessing(true);
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      toast.success(t("auth.loginSuccess"));
      setAuthMode(null);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t("auth.loginError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const isExpired = invitation?.expiresAt
    ? new Date(invitation.expiresAt) < new Date()
    : false;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <IconAlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">
              {t("invitations.invalidLink")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              {t("invitations.invalidLinkDescription")}
            </p>
            <Button onClick={() => navigate({ to: "/" })}>
              {t("common.goHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <IconLoader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t("invitations.loadingInvitation")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitationError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <IconAlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">
              {t("invitations.notFound")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              {t("invitations.notFoundDescription")}
            </p>
            <Button onClick={() => navigate({ to: "/" })}>
              {t("common.goHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <IconAlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">
              {t("invitations.expired")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              {t("invitations.expiredDescription")}
            </p>
            <Button onClick={() => navigate({ to: "/" })}>
              {t("common.goHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.status !== "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <IconCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {t("invitations.alreadyProcessed")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              {t("invitations.alreadyProcessedDescription", {
                status: invitation.status,
              })}
            </p>
            <Button onClick={() => navigate({ to: "/projects" })}>
              {t("common.goToDashboard")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
              <IconMail className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl">{t("invitations.title")}</CardTitle>
            <p className="text-muted-foreground">{t("invitations.subtitle")}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IconBriefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {invitation.organizationName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("invitations.invitedAs")}{" "}
                    <strong>{invitation.role}</strong>
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("invitations.invitedBy")}:
                  </span>
                  <span>{invitation.inviterEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("invitations.expires")}:
                  </span>
                  <span>{formatDate(invitation.expiresAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("common.status")}:
                  </span>
                  <Badge variant="secondary">{invitation.status}</Badge>
                </div>
              </div>
            </div>

            {authMode === null && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    {t("invitations.authRequired")}
                  </p>
                </div>
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setAuthMode("login")}
                    className="w-full"
                  >
                    {t("auth.loginExistingAccount")}
                  </Button>
                  <Button
                    onClick={() => setAuthMode("signup")}
                    className="w-full"
                  >
                    {t("auth.createNewAccount")}
                  </Button>
                </div>
              </div>
            )}

            {authMode === "login" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t("auth.login")}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAuthMode(null)}
                  >
                    {t("common.back")}
                  </Button>
                </div>
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.email")}</FormLabel>
                          <FormControl>
                            <Input type="email" disabled {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.password")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t("auth.passwordPlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing && (
                        <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {t("auth.login")}
                    </Button>
                  </form>
                </Form>
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setAuthMode("signup")}
                    className="text-sm"
                  >
                    {t("auth.dontHaveAccount")}
                  </Button>
                </div>
              </div>
            )}

            {authMode === "signup" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {t("auth.signup.title")}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAuthMode(null)}
                  >
                    {t("common.back")}
                  </Button>
                </div>
                <Form {...signupForm}>
                  <form
                    onSubmit={signupForm.handleSubmit(handleSignup)}
                    className="space-y-4"
                  >
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.name")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("auth.namePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.email")}</FormLabel>
                          <FormControl>
                            <Input type="email" disabled {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.password")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t("auth.passwordPlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing && (
                        <IconLoader className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {t("auth.createAccount")}
                    </Button>
                  </form>
                </Form>
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setAuthMode("login")}
                    className="text-sm"
                  >
                    {t("auth.alreadyHaveAccount")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.email !== invitation.email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <IconAlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">
              {t("invitations.wrongAccount")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-sm">
              <p className="mb-2">
                <strong>{t("invitations.invitedEmail")}:</strong>{" "}
                {invitation.email}
              </p>
              <p>
                <strong>{t("invitations.currentEmail")}:</strong> {user.email}
              </p>
            </div>
            <p className="text-muted-foreground">
              {t("invitations.wrongAccountDescription")}
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={async () => {
                  await authClient.signOut();
                  window.location.reload();
                }}
                className="w-full"
              >
                {t("auth.switchAccount")}
              </Button>
              <Button onClick={() => navigate({ to: "/" })} className="w-full">
                {t("common.goHome")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
            <IconUsers className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl">
            {t("invitations.readyToJoin")}
          </CardTitle>
          <p className="text-muted-foreground">
            {t("invitations.readyToJoinDescription")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <IconBriefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {invitation.organizationName}
                </h3>
                <p className="text-muted-foreground">
                  {t("invitations.joinAs")} <strong>{invitation.role}</strong>
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  {t("invitations.invitedBy")}
                </p>
                <p className="font-medium">{invitation.inviterEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {t("invitations.expires")}
                </p>
                <p className="font-medium">
                  {formatDate(invitation.expiresAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleAcceptInvitation}
              className="w-full h-12 text-base"
              disabled={isProcessing}
            >
              {(isAccepting || isProcessing) && (
                <IconLoader className="h-5 w-5 mr-2 animate-spin" />
              )}
              <IconCheck className="h-5 w-5 mr-2" />
              {t("invitations.acceptInvitation")}
            </Button>
            <Button
              variant="outline"
              onClick={handleRejectInvitation}
              className="w-full h-12 text-base"
              disabled={isProcessing}
            >
              {(isRejecting || isProcessing) && (
                <IconLoader className="h-5 w-5 mr-2 animate-spin" />
              )}
              <IconX className="h-5 w-5 mr-2" />
              {t("invitations.rejectInvitation")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
