import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSetActiveOrganization } from "@/services/organizations/mutations";
import {
  useGetOrganization,
  useGetOrganizationsList,
} from "@/services/organizations/query";
import { ChevronDown, Plus, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Skeleton } from "./skeleton";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { EditProjectDialog } from "@/components/project/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/project/delete-project-dialog";

type Organization = { id: string; name: string; logo?: string | null };

export function OrganizationSwitcher() {
  const {
    data: organizations,
    isLoading: organizationsLoading,
    isFetching: organizationsFetching,
  } = useGetOrganizationsList();
  const {
    data: activeOrganization,
    isLoading: activeOrgLoading,
    isFetching: activeOrgFetching,
  } = useGetOrganization();
  const { mutate: setActiveOrganization, isPending: isChangingOrg } =
    useSetActiveOrganization();
  const { t } = useTranslation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<Organization | null>(null);
  const [deleteOrg, setDeleteOrg] = useState<Organization | null>(null);

  const openEdit = (org: Organization) => {
    setEditOrg(org);
    setEditModalOpen(true);
  };

  const openDelete = (org: Organization) => {
    setDeleteOrg(org);
    setDeleteModalOpen(true);
  };

  const handleOrgChange = (org: { id: string }) => {
    setActiveOrganization(org.id);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(t("organization.copied"));
  };

  const isEmpty = !organizations || organizations.length === 0;
  const isLoading =
    organizationsLoading ||
    activeOrgLoading ||
    isChangingOrg ||
    organizationsFetching ||
    activeOrgFetching;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit p-1.5">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="size-5 rounded-sm" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </div>
              ) : isEmpty ? (
                <>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="font-semibold">
                      {t("organization.empty_action")}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Avatar className="size-5 rounded-sm flex text-xs bg-sidebar-primary text-white">
                    <AvatarImage src={activeOrganization?.logo || undefined} />
                    <AvatarFallback className="text-xs bg-sidebar-primary text-white">
                      {activeOrganization?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex flex-col font-semibold">
                    {activeOrganization?.name}
                    <div
                      className="text-[10px] text-muted-foreground font-mono truncate cursor-pointer hover:underline"
                      tabIndex={0}
                      title={activeOrganization?.id}
                      aria-label={t("organization.copy_id")}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (activeOrganization)
                          handleCopyId(activeOrganization.id);
                      }}
                    >
                      {activeOrganization?.id}
                    </div>
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {isLoading ? (
              <div className="p-2 space-y-2">
                <Skeleton className="h-4 w-16" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 p-2">
                    <Skeleton className="size-5 rounded-sm" />
                    <div className="flex flex-col gap-1 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setCreateModalOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  {t("organization.add_project")}
                </div>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {t("navigation.projects")}
                </DropdownMenuLabel>
                {organizations.map((org: Organization) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between group"
                  >
                    <DropdownMenuItem
                      onClick={() => handleOrgChange(org)}
                      className="gap-2 p-2 flex-1"
                    >
                      <Avatar className="size-5 rounded-sm flex text-xs bg-sidebar-primary text-white">
                        <AvatarImage src={org.logo || undefined} />
                        <AvatarFallback className="text-xs bg-sidebar-primary text-white">
                          {org.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{org.name}</span>
                        <span
                          className="text-[10px] text-muted-foreground font-mono truncate cursor-pointer hover:underline"
                          tabIndex={0}
                          title={org.id}
                          aria-label={t("organization.copy_id")}
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCopyId(org.id);
                          }}
                        >
                          {org.id}
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          onClick={(e) => e.stopPropagation()}
                          title="Project actions"
                          type="button"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(org)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDelete(org)}
                          className="text-destructive"
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    {t("organization.add_project")}
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <CreateProjectDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <EditProjectDialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        organization={editOrg}
      />

      <DeleteProjectDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setDeleteOrg(null);
        }}
        organization={deleteOrg}
      />
    </SidebarMenu>
  );
}
