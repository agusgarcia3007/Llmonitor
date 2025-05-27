import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_dashboard/api-keys")({
  component: ApiKeysPage,
});

type ApiKey = {
  id: string;
  name: string | null;
  start?: string | null;
  prefix?: string | null;
  enabled: boolean;
  createdAt: string;
};

function ApiKeysPage() {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchApiKeys() {
    setLoading(true);
    const { data, error } = await authClient.apiKey.list();
    if (error) {
      toast.error(error.message);
      setApiKeys([]);
    } else {
      setApiKeys(
        (data || []).map((k) => ({
          id: k.id,
          name: k.name,
          start: k.start,
          prefix: k.prefix,
          enabled: k.enabled,
          createdAt:
            typeof k.createdAt === "string"
              ? k.createdAt
              : new Date(k.createdAt).toISOString(),
        }))
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function handleCreateKey() {
    if (!newKeyName.trim()) {
      toast.error(t("apiKeys.error.enterName"));
      return;
    }
    setCreating(true);
    const { data, error } = await authClient.apiKey.create({
      name: newKeyName,
    });
    setCreating(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCreatedKey(data.key);
    setNewKeyName("");
    fetchApiKeys();
    toast.success(t("apiKeys.success.created"));
  }

  async function handleDeleteKey(id: string) {
    setDeletingId(id);
    const { error } = await authClient.apiKey.delete({ keyId: id });
    setDeletingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    fetchApiKeys();
    toast.success(t("apiKeys.success.deleted"));
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success(t("apiKeys.success.copied"));
  };

  const handleToggleVisibility = (id: string) => {
    setShowKeyId((prev) => (prev === id ? null : id));
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
                disabled={creating}
              />
              <Button onClick={handleCreateKey} disabled={creating}>
                <Plus className="w-4 h-4 mr-2" />
                {creating
                  ? t("apiKeys.button.creating")
                  : t("apiKeys.button.create")}
              </Button>
            </div>
            {createdKey && (
              <Dialog
                open={!!createdKey}
                onOpenChange={(open) => {
                  if (!open) setCreatedKey(null);
                }}
              >
                <DialogContent>
                  <DialogTitle>{t("apiKeys.modal.title")}</DialogTitle>
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-mono text-base break-all bg-muted px-3 py-2 rounded select-all">
                      {createdKey}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyKey(createdKey)}
                    >
                      <Copy className="w-4 h-4 mr-1" />{" "}
                      {t("apiKeys.button.copy")}
                    </Button>
                    <DialogDescription className="text-center max-w-xs">
                      {t("apiKeys.modal.description")}
                    </DialogDescription>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        {t("apiKeys.button.close")}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="space-y-3">
            {loading ? (
              <div>{t("apiKeys.loading")}</div>
            ) : apiKeys.length > 0 ? (
              apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {apiKey.name ?? t("apiKeys.noName")}
                      </p>
                      <Badge variant="secondary">
                        {apiKey.enabled
                          ? t("apiKeys.active")
                          : t("apiKeys.disabled")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {showKeyId === apiKey.id
                          ? apiKey.start ||
                            apiKey.prefix ||
                            apiKey.id.slice(0, 7)
                          : `${(
                              apiKey.start ||
                              apiKey.prefix ||
                              apiKey.id
                            ).slice(0, 7)}${"*".repeat(10)}`}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(apiKey.id)}
                      >
                        {showKeyId === apiKey.id ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopyKey(
                            apiKey.start || apiKey.prefix || apiKey.id
                          )
                        }
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
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
                    disabled={deletingId === apiKey.id}
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
