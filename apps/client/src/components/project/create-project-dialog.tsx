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
import { useCheckSlug } from "@/services/organizations/query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";

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

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  logo: z.string(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

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
  const [manualSlugEdit, setManualSlugEdit] = useState(false);

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
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

  const { data: slugCheck, isLoading: isCheckingSlug } = useCheckSlug(
    debouncedSlug && isSlugDirty ? debouncedSlug : ""
  );

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
    if (debouncedSlug && slugCheck && !slugCheck.status) {
      form.setError("slug", {
        type: "manual",
        message: "This slug is already taken",
      });
    } else if (debouncedSlug && slugCheck?.status) {
      form.clearErrors("slug");
    }
  }, [debouncedSlug, slugCheck, form]);

  const handleSave = async (values: CreateProjectFormData) => {
    try {
      await createOrganization.mutateAsync({
        name: values.name,
        slug: values.slug,
        logo: values.logo,
      });
      toast.success(t("projects.projectCreated"));
      onOpenChange(false);
      form.reset({ name: "", slug: "", logo: "" });
      setManualSlugEdit(false);
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
                  {isCheckingSlug && debouncedSlug && isSlugDirty && (
                    <p className="text-sm text-muted-foreground">
                      Checking availability...
                    </p>
                  )}
                  {debouncedSlug && isSlugDirty && slugCheck?.status && (
                    <p className="text-sm text-green-600">Slug is available</p>
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
              <Button
                type="submit"
                isLoading={createOrganization.isPending}
                disabled={
                  (isSlugDirty && isCheckingSlug) ||
                  (!!debouncedSlug && isSlugDirty && !slugCheck?.status)
                }
              >
                {t("common.create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
