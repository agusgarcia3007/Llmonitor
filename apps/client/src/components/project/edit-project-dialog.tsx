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
import { useCheckSlug } from "@/services/organizations/query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const useDebounce = <T,>(value: T, delay?: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

const editProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  logo: z.string(),
});

type EditProjectFormData = z.infer<typeof editProjectSchema>;

type Organization = {
  id: string;
  name: string;
  slug?: string | null;
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
  const [manualSlugEdit, setManualSlugEdit] = useState(false);

  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
    },
  });

  const watchedName = form.watch("name");
  const watchedSlug = form.watch("slug");
  const debouncedSlug = useDebounce(watchedSlug, 500);
  const isSlugDirty = form.formState.dirtyFields.slug;
  const isSlugUnchanged = organization?.slug === watchedSlug;

  const { data: slugCheck, isLoading: isCheckingSlug } = useCheckSlug(
    debouncedSlug && isSlugDirty && !isSlugUnchanged ? debouncedSlug : ""
  );

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        slug: organization.slug || "",
        logo: organization.logo || "",
      });
      setManualSlugEdit(false);
    }
  }, [organization, form]);

  useEffect(() => {
    if (!manualSlugEdit && watchedName) {
      const autoSlug = watchedName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      form.setValue("slug", autoSlug);
    }
  }, [watchedName, manualSlugEdit, form]);

  useEffect(() => {
    if (
      debouncedSlug &&
      organization?.slug !== debouncedSlug &&
      slugCheck &&
      !slugCheck.status
    ) {
      form.setError("slug", {
        type: "manual",
        message: "This slug is already taken",
      });
    } else if (
      debouncedSlug &&
      (organization?.slug === debouncedSlug || slugCheck?.status)
    ) {
      form.clearErrors("slug");
    }
  }, [debouncedSlug, slugCheck, form, organization?.slug]);

  const handleSave = async (values: EditProjectFormData) => {
    if (!organization) return;

    try {
      await updateOrganization.mutateAsync({
        id: organization.id,
        name: values.name,
        slug: values.slug,
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("projects.slug")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        setManualSlugEdit(true);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  {isCheckingSlug &&
                    debouncedSlug &&
                    isSlugDirty &&
                    !isSlugUnchanged && (
                      <p className="text-sm text-muted-foreground">
                        Checking availability...
                      </p>
                    )}
                  {debouncedSlug &&
                    (isSlugUnchanged || (isSlugDirty && slugCheck?.status)) && (
                      <p className="text-sm text-green-600">
                        {isSlugUnchanged ? "Current slug" : "Slug is available"}
                      </p>
                    )}
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
              <Button
                type="submit"
                isLoading={updateOrganization.isPending}
                disabled={
                  (isSlugDirty && !isSlugUnchanged && isCheckingSlug) ||
                  (!!debouncedSlug &&
                    isSlugDirty &&
                    !isSlugUnchanged &&
                    !slugCheck?.status)
                }
              >
                {t("organization.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
