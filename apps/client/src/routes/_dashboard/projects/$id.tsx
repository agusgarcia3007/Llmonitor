import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconCopy,
  IconDots,
  IconEdit,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconX
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { EditProjectDialog } from "@/components/project/edit-project-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  useCancelInvitation,
  useInviteMember,
} from "@/services/organizations/mutations";
import { useGetOrganizationById } from "@/services/organizations/query";
import { toast } from "sonner";

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
      <div className="container mx-auto max-w-7xl p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto max-w-7xl min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6">
        <IconBuilding className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">{t("projects.notFound")}</h1>
        <p className="text-muted-foreground">
          {t("projects.notFoundDescription")}
        </p>
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
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/projects"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{organization.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <IconCalendar className="h-3.5 w-3.5" />
              <span>{formatDate(organization.createdAt)}</span>
              <span className="text-muted-foreground">•</span>
              <span>
                {organization.members?.length || 0} {t("projects.membersCount")}
              </span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <IconDots className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <IconEdit className="h-4 w-4 mr-2" />
              {t("common.edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <IconTrash className="h-4 w-4 mr-2" />
              {t("common.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {t("projects.organizationDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("organization.name")}
              </dt>
              <dd className="mt-1 text-sm">{organization.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("projects.slug")}
              </dt>
              <dd className="mt-1 text-sm font-mono">{organization.slug}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {t("projects.organizationId")}
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {organization.id}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(organization.id)}
                >
                  {copiedId ? (
                    <IconCheck className="h-3 w-3" />
                  ) : (
                    <IconCopy className="h-3 w-3" />
                  )}
                </Button>
              </dd>
            </div>
            {organization.metadata?.description && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  {t("projects.description")}
                </dt>
                <dd className="mt-1 text-sm">
                  {organization.metadata.description}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">
            {t("projects.members")}
          </CardTitle>
          <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
            <IconUserPlus className="h-4 w-4 mr-2" />
            {t("projects.inviteMember")}
          </Button>
        </CardHeader>
        <CardContent>
          {organization.members && organization.members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("projects.member")}</TableHead>
                  <TableHead>{t("projects.email")}</TableHead>
                  <TableHead>{t("projects.role")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organization.members.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member.user?.name
                              ? getInitials(member.user.name)
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {member.user?.name || t("projects.unknownUser")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.user?.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role || t("projects.roles.member")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <IconDots className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            {t("projects.changeRole")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            {t("projects.removeMember")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <IconUsers className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {t("projects.noMembers")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {organization.invitations && organization.invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {t("projects.pendingInvitations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("projects.email")}</TableHead>
                  <TableHead>{t("projects.role")}</TableHead>
                  <TableHead>{t("projects.status")}</TableHead>
                  <TableHead>{t("projects.expires")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organization.invitations
                  .filter((inv) => inv.status === "pending")
                  .map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invitation.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{invitation.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invitation.expiresAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isCancellingInvitation}
                          onClick={async () => {
                            await cancelInvitation(invitation.id);
                            toast.success(t("projects.invitationCanceled"));
                          }}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("projects.inviteMember")}</DialogTitle>
            <DialogDescription>
              {t("projects.inviteMemberDescription")}
            </DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form
              onSubmit={inviteForm.handleSubmit(handleInviteMember)}
              className="space-y-4"
            >
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("projects.emailAddress")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("projects.emailPlaceholder")}
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
                  <FormItem>
                    <FormLabel>{t("projects.role")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("projects.selectRole")} />
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
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" isLoading={isInvitingMember}>
                  {t("projects.sendInvitation")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <EditProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        organization={organization}
      />
    </div>
  );
}
