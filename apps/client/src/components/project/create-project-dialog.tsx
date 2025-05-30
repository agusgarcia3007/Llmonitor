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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<{ name: string; logo: string }>({
    defaultValues: { name: "", logo: "" },
  });

  const handleSave = async (values: { name: string; logo: string }) => {
    setLoading(true);
    try {
      await authClient.organization.create({
        name: values.name,
        slug: values.name.toLowerCase().replace(/\s+/g, "-"),
        logo: values.logo,
      });
      toast.success(t("projects.projectCreated"));
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
      form.reset({ name: "", logo: "" });
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
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
              <Button type="submit" disabled={loading}>
                {t("common.create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
