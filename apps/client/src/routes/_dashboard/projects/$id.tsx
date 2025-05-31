import {
  IconArrowLeft,
  IconBriefcase,
  IconCalendarTime,
  IconEdit,
  IconMail,
  IconMapPin,
  IconSettings,
  IconTrash,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { EditProjectDialog } from "@/components/project/edit-project-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetOrganizationById } from "@/services/organizations/query";

export const Route = createFileRoute("/_dashboard/projects/$id")({
  component: ProjectDetailsPage,
});

function ProjectDetailsPage() {
  const { t } = useTranslation();
  const { id } = Route.useParams();
  const { data: organization, isLoading } = useGetOrganizationById(id);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <IconBriefcase className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">{t("projects.notFound")}</h2>
          <p className="text-muted-foreground">
            {t("projects.notFoundDescription")}
          </p>
        </div>
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
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/projects"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            params={{ id: organization.id }}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {organization.name}
            </h1>
            {organization.slug && (
              <p className="text-muted-foreground">
                {organization.slug || "No slug available"}
              </p>
            )}
            {organization.metadata?.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {organization.metadata.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <IconEdit className="h-4 w-4" />
            {t("common.edit")}
          </Button>
          <Button variant="outline" className="text-destructive">
            <IconTrash className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBriefcase className="h-5 w-5" />
              {t("projects.basicInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("organization.name")}
              </p>
              <p className="text-sm">{organization.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Slug</p>
              <p className="text-sm font-mono">{organization.slug}</p>
            </div>
            {organization.createdAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <IconCalendarTime className="h-4 w-4" />
                  {t("common.created")}
                </p>
                <p className="text-sm">{formatDate(organization.createdAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="h-5 w-5" />
              {t("projects.members")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {organization.members && organization.members.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {organization.members.length} {t("projects.totalMembers")}
                </p>
                <div className="flex -space-x-2">
                  {organization.members.slice(0, 5).map((member, index) => (
                    <span className="flex items-center gap-x-2">
                      <Avatar
                        key={index}
                        className="h-8 w-8 border-2 border-background"
                      >
                        <AvatarFallback className="text-xs">
                          {member.user?.name
                            ? getInitials(member.user.name)
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.user?.name}</span>
                    </span>
                  ))}
                  {organization.members.length > 5 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                      +{organization.members.length - 5}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("projects.noMembers")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSettings className="h-5 w-5" />
              {t("projects.settings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("projects.status")}
              </p>
              <Badge variant="secondary">{t("projects.active")}</Badge>
            </div>
            {organization.metadata && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("projects.metadata")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Object.keys(organization.metadata).length}{" "}
                  {t("projects.properties")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invitations */}
        {organization.invitations && organization.invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconMail className="h-5 w-5" />
                {t("projects.invitations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {organization.invitations.length}{" "}
                  {t("projects.pendingInvitations")}
                </p>
                <div className="space-y-1">
                  {organization.invitations
                    .slice(0, 3)
                    .map((invitation, index) => (
                      <div
                        key={index}
                        className="text-xs text-muted-foreground"
                      >
                        {invitation.email}
                      </div>
                    ))}
                  {organization.invitations.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{organization.invitations.length - 3} {t("common.more")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconWorld className="h-5 w-5" />
              {t("projects.apiInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("projects.organizationId")}
              </p>
              <p className="text-xs font-mono bg-muted p-2 rounded">
                {organization.id}
              </p>
            </div>
            {organization.logo && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("projects.logoUrl")}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {organization.logo}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5" />
              {t("projects.additional")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("projects.type")}
              </p>
              <p className="text-sm">{t("projects.organization")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t("projects.organizationId")}
              </p>
              <p className="text-xs font-mono bg-muted p-2 rounded">
                {organization.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        organization={organization}
      />
    </div>
  );
}
