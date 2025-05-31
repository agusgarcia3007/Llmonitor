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
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateOrganization } from "@/services/organizations/mutations";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const { t } = useTranslation();
  const createOrganization = useCreateOrganization();

  const form = useForm<{ name: string; logo: string }>({
    defaultValues: { name: "", logo: "" },
  });

  const handleSave = async (values: { name: string; logo: string }) => {
    try {
      await createOrganization.mutateAsync({
        name: values.name,
        slug: values.name.toLowerCase().replace(/\s+/g, "-"),
        logo: values.logo,
      });
      toast.success(t("projects.projectCreated"));
      onOpenChange(false);
      form.reset({ name: "", logo: "" });
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t("projects.createProject")}</DialogTitle>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSave)}>
            <FormField
              control={form.control}
              name="name"
              rules={{ required: t("organization.name_required") }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("projects.projectName")}</FormLabel>
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
                  <FormLabel>{t("projects.projectLogo")}</FormLabel>
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
                {t("common.cancel")}
              </Button>
              <Button type="submit" isLoading={createOrganization.isPending}>
                {t("common.create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
