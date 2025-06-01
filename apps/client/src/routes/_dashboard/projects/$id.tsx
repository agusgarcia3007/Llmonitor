import {
  IconArrowLeft,
  IconBriefcase,
  IconCalendarTime,
  IconEdit,
  IconMail,
  IconSettings,
  IconTrash,
  IconUsers,
  IconWorld,
  IconCopy,
  IconCheck,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { EditProjectDialog } from "@/components/project/edit-project-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useGetOrganizationById } from "@/services/organizations/query";
import {
  useCancelInvitation,
  useInviteMember,
} from "@/services/organizations/mutations";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const inviteFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.enum(["member", "admin", "owner"], {
    required_error: "Role is required",
  }),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

export const Route = createFileRoute("/_dashboard/projects/$id")({
  component: ProjectDetailsPage,
});

function ProjectDetailsPage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const { data: organization, isLoading } = useGetOrganizationById(id);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const { mutateAsync: inviteMember, isPending: isInvitingMember } =
    useInviteMember();
  const { mutateAsync: cancelInvitation, isPending: isCancellingInvitation } =
    useCancelInvitation();

  const inviteForm = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleInviteMember = async (data: InviteFormData) => {
    if (!organization) return;

    await inviteMember({
      email: data.email,
      role: data.role,
      organizationId: organization.id,
    });

    toast.success(t("projects.invitationSentSuccessfully"));
    inviteForm.reset();
    setInviteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-5 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-48">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto max-w-7xl min-h-[60vh] flex flex-col items-center justify-center gap-6 p-6">
        <div className="rounded-full bg-muted p-6">
          <IconBriefcase className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{t("projects.notFound")}</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            {t("projects.notFoundDescription")}
          </p>
        </div>
        <Link
          to="/projects"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <IconArrowLeft className="h-4 w-4 mr-2" />
          {t("common.goBack")}
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl" />
        <div className="relative p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <Link
                to="/projects"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "rounded-full"
                )}
              >
                <IconArrowLeft className="h-5 w-5" />
              </Link>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <IconBriefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight">
                        {organization.name}
                      </h1>
                      {organization.slug && (
                        <p className="text-lg text-muted-foreground font-mono">
                          @{organization.slug}
                        </p>
                      )}
                    </div>
                  </div>
                  {organization.metadata?.description && (
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                      {organization.metadata.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {organization.createdAt && (
                    <div className="flex items-center gap-2">
                      <IconCalendarTime className="h-4 w-4" />
                      <span>
                        {t("projects.created")}{" "}
                        {formatDate(organization.createdAt)}
                      </span>
                    </div>
                  )}
                  {organization.members && (
                    <div className="flex items-center gap-2">
                      <IconUsers className="h-4 w-4" />
                      <span>
                        {organization.members.length}{" "}
                        {t("projects.membersCount")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2"
              >
                <IconEdit className="h-4 w-4" />
                {t("common.edit")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 text-destructive hover:text-destructive"
              >
                <IconTrash className="h-4 w-4" />
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Members Card */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <IconUsers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  {t("projects.members")}
                  {organization.members && (
                    <Badge variant="secondary">
                      {organization.members.length}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setInviteDialogOpen(true)}
                >
                  <IconUserPlus className="h-4 w-4" />
                  {t("projects.inviteMember")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {organization.members && organization.members.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {organization.members.slice(0, 6).map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {member.user?.name
                              ? getInitials(member.user.name)
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">
                            {member.user?.name || t("projects.unknownUser")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.user?.email}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {member.role || t("projects.roles.member")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {organization.members.length > 6 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground text-center">
                        {t("projects.andMoreMembers", {
                          count: organization.members.length - 6,
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <IconUsers className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {t("projects.noMembers")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invitation Management */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <IconMail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                {t("projects.invitationManagement")}
                {organization.invitations &&
                  organization.invitations.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {organization.invitations.length} {t("projects.pending")}
                    </Badge>
                  )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      {t("projects.sendNewInvitation")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("projects.inviteNewMembersDescription")}
                    </p>
                  </div>
                  <Dialog
                    open={inviteDialogOpen}
                    onOpenChange={setInviteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <IconUserPlus className="h-4 w-4" />
                        {t("projects.inviteMember")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("projects.inviteMember")}</DialogTitle>
                      </DialogHeader>
                      <Form {...inviteForm}>
                        <form
                          onSubmit={inviteForm.handleSubmit(handleInviteMember)}
                          className="space-y-4 pt-4"
                        >
                          <div className="flex items-center w-full">
                            <FormField
                              control={inviteForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="w-full">
                                  <FormLabel>
                                    {t("projects.emailAddress")}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="email"
                                      className="rounded-r-none"
                                      placeholder={t(
                                        "projects.emailPlaceholder"
                                      )}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={inviteForm.control}
                              name="role"
                              render={({ field }) => (
                                <FormItem className="mt-[22px]">
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="rounded-l-none border-l-0 m-0 bg-primary/10">
                                        <SelectValue
                                          placeholder={t("projects.selectRole")}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="member">
                                        {t("projects.roles.member")}
                                      </SelectItem>
                                      <SelectItem value="admin">
                                        {t("projects.roles.admin")}
                                      </SelectItem>
                                      <SelectItem value="owner">
                                        {t("projects.roles.owner")}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <Button type="submit" isLoading={isInvitingMember}>
                            {t("projects.sendInvitation")}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {organization.invitations &&
                organization.invitations.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {t("projects.pendingInvitations")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {organization.invitations.length}{" "}
                        {t("projects.invitations")}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {organization.invitations.map((invitation, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                        >
                          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                            <IconMail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{invitation.email}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                {t("projects.role")}: {invitation.role}
                              </span>
                              <span>•</span>
                              <span>
                                {t("projects.expires")}{" "}
                                {formatDate(invitation.expiresAt)}
                              </span>
                              <span>•</span>
                              <span className="capitalize">
                                {invitation.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                invitation.status === "canceled"
                                  ? "destructive"
                                  : invitation.status === "accepted"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {invitation.status}
                            </Badge>
                            {invitation.status === "pending" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    disabled={isCancellingInvitation}
                                    onClick={async () => {
                                      await cancelInvitation(invitation.id);
                                      toast.success(
                                        t("projects.invitationCanceled")
                                      );
                                    }}
                                  >
                                    <IconX className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t("projects.cancelInvitation")}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <IconMail className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {t("projects.noPendingInvitations")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("projects.sendInvitationsDescription")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <IconBriefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                {t("projects.basicInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("organization.name")}
                  </p>
                  <p className="font-medium">{organization.name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("projects.slug")}
                  </p>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {organization.slug}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("projects.status")}
                  </p>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {t("projects.active")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <IconWorld className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                {t("projects.apiInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("projects.organizationId")}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted p-3 rounded-lg font-mono break-all">
                    {organization.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(organization.id)}
                    className="shrink-0"
                  >
                    {copiedId ? (
                      <IconCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <IconCopy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <IconSettings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                {t("projects.settings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {organization.metadata && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t("projects.metadata")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Object.keys(organization.metadata).length}{" "}
                    {t("projects.properties")}
                  </p>
                </div>
              )}
              {organization.logo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t("projects.logo")}
                  </p>
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={organization.logo}
                      alt={t("projects.organizationLogo")}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EditProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        organization={organization}
      />
    </div>
  );
}
