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
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type Organization = {
  id: string;
  name: string;
  logo?: string | null;
};

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  organization,
}: DeleteProjectDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!organization) return;

    setLoading(true);
    try {
      await authClient.organization.delete({
        organizationId: organization.id,
      });
      toast.success(t("projects.projectDeleted"));
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
      onOpenChange(false);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("projects.deleteConfirmTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("projects.deleteConfirmDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={loading}
          >
            {t("projects.deleteProject")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
