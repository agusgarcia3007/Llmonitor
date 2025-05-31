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
import { useUpdateOrganization } from "@/services/organizations/mutations";
import { useEffect } from "react";
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
  const updateOrganization = useUpdateOrganization();

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

    try {
      await updateOrganization.mutateAsync({
        id: organization.id,
        name: values.name,
        slug: values.name.toLowerCase().replace(/\s+/g, "-"),
        logo: values.logo,
      });
      toast.success(t("projects.projectUpdated"));
      onOpenChange(false);
    } catch {
      toast.error(t("common.error"));
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
              <Button type="submit" isLoading={updateOrganization.isPending}>
                {t("organization.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
