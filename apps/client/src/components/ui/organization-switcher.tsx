import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type Organization = { id: string; name: string; logo?: string | null };

export function OrganizationSwitcher() {
  const { data: organizations } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<Organization | null>(null);
  const [deleteOrg, setDeleteOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<{ name: string; logo: string }>({
    defaultValues: { name: "", logo: "" },
  });

  const openCreate = () => {
    setEditOrg(null);
    form.reset({ name: "", logo: "" });
    setModalOpen(true);
  };

  const openEdit = (org: Organization) => {
    setEditOrg(org);
    form.reset({ name: org.name, logo: org.logo || "" });
    setModalOpen(true);
  };

  const handleSave = async (values: { name: string; logo: string }) => {
    setLoading(true);
    try {
      if (editOrg) {
        await authClient.organization.update({
          data: { name: values.name, logo: values.logo },
          organizationId: editOrg.id,
        });
      } else {
        await authClient.organization.create({
          name: values.name,
          slug: values.name.toLowerCase().replace(/\s+/g, "-"),
          logo: values.logo,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["llm-events"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
        exact: false,
      });
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = async (org: { id: string }) => {
    await authClient.organization.setActive({ organizationId: org.id });
    queryClient.invalidateQueries({ queryKey: ["llm-events"], exact: false });
    queryClient.invalidateQueries({
      queryKey: ["dashboard-stats"],
      exact: false,
    });
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(t("organization.copied"));
  };

  if (!organizations || organizations.length === 0 || !activeOrganization) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-fit p-1.5">
              <Avatar className="size-5 rounded-sm flex text-xs bg-sidebar-primary text-white">
                <AvatarImage src={activeOrganization.logo || undefined} />
                <AvatarFallback className="text-xs bg-sidebar-primary text-white">
                  {activeOrganization.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="flex flex-col font-semibold">
                {activeOrganization.name}
                <div
                  className="text-[10px] text-muted-foreground font-mono truncate cursor-pointer hover:underline"
                  tabIndex={0}
                  title={activeOrganization.id}
                  aria-label={t("organization.copy_id")}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyId(activeOrganization.id);
                  }}
                >
                  {activeOrganization.id}
                </div>
              </span>
              <ChevronDown className="w-4 h-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t("projects")}
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
                      onClick={() => setDeleteOrg(org)}
                      className="text-destructive"
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={openCreate}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                {t("add_project")}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogTitle>
            {editOrg ? "Edit project" : "Create project"}
          </DialogTitle>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleSave)}
            >
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("name")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("logo_url")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={loading}>
                  {editOrg ? t("save") : t("create")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleteOrg}
        onOpenChange={(open) => {
          if (!open) setDeleteOrg(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_project_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_project_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOrg(null)}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteOrg) {
                  setLoading(true);
                  try {
                    await authClient.organization.delete({
                      organizationId: deleteOrg.id,
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["llm-events"],
                      exact: false,
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["dashboard-stats"],
                      exact: false,
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["organizations"],
                      exact: false,
                    });
                  } finally {
                    setLoading(false);
                    setDeleteOrg(null);
                  }
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenu>
  );
}
