import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type Organization = {
  id: string;
  name: string;
  logo?: string | null;
};

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
}

export function EditProjectDialog({
  open,
  onOpenChange,
  organization,
}: EditProjectDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<{ name: string; logo: string }>({
    defaultValues: { name: "", logo: "" },
  });

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        logo: organization.logo || "",
      });
    }
  }, [organization, form]);

  const handleSave = async (values: { name: string; logo: string }) => {
    if (!organization) return;

    setLoading(true);
    try {
      await authClient.organization.update({
        data: { name: values.name, logo: values.logo },
        organizationId: organization.id,
      });
      toast.success(t("projects.projectUpdated"));
      queryClient.invalidateQueries({ queryKey: ["llm-events"], exact: false });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t("organization.edit")}</DialogTitle>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSave)}>
            <FormField
              control={form.control}
              name="name"
              rules={{ required: t("organization.name_required") }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("organization.name")}</FormLabel>
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
                  <FormLabel>{t("organization.logo_url")}</FormLabel>
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
                onClick={() => onOpenChange(false)}
              >
                {t("organization.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {t("organization.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
