import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useCreateApiKey,
  useDeleteApiKey,
} from "@/services/api-keys/mutations";
import { useApiKeysQuery } from "@/services/api-keys/query";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Key, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_dashboard/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const { t } = useTranslation();
  const [newKeyName, setNewKeyName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useApiKeysQuery();
  const {
    data: createdKey,
    mutateAsync: createApiKey,
    isPending: isCreating,
  } = useCreateApiKey();
  const { mutateAsync: deleteApiKey, isPending: isDeleting } =
    useDeleteApiKey();

  const handleCreateKey = async () => {
    await createApiKey(newKeyName);
    setIsOpen(true);
  };

  const handleDeleteKey = async (keyId: string) => {
    await deleteApiKey(keyId);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(t("apiKeys.success.copied"));
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            {t("apiKeys.title")}
          </CardTitle>
          <CardDescription>{t("apiKeys.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t("apiKeys.input.placeholder")}
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                disabled={isCreating}
              />
              <Button onClick={handleCreateKey} isLoading={isCreating}>
                <Plus className="size-4" />
                {isCreating
                  ? t("apiKeys.button.creating")
                  : t("apiKeys.button.create")}
              </Button>
            </div>
            {createdKey && (
              <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
                <DialogContent>
                  <DialogTitle>{t("apiKeys.modal.title")}</DialogTitle>
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-mono text-base break-all bg-muted px-3 py-2 rounded select-all">
                      {createdKey?.data?.key}{" "}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleCopyKey(createdKey?.data?.key ?? "")
                        }
                      >
                        <Copy className="w-4 h-4" />{" "}
                      </Button>
                    </span>

                    <DialogDescription className="text-center max-w-xs">
                      {t("apiKeys.modal.description")}
                    </DialogDescription>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1 w-full">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-28 mt-2" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                ))}
              </div>
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {apiKey.name ?? t("apiKeys.noName")}
                      </p>
                      <Badge variant={apiKey.enabled ? "default" : "outline"}>
                        {apiKey.enabled
                          ? t("apiKeys.active")
                          : t("apiKeys.disabled")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {(apiKey.start || apiKey.prefix || apiKey.id).slice(
                          0,
                          7
                        )}
                        {"*".repeat(10)}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("apiKeys.created")}:{" "}
                      {new Date(apiKey.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteKey(apiKey.id)}
                    isLoading={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">{t("apiKeys.noKeys")}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
