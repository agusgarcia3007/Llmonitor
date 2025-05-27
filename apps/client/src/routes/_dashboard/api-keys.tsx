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
      toast.error("Please enter a name for the API key");
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
    toast.success("API key created successfully");
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
    toast.success("API key deleted");
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleToggleVisibility = (id: string) => {
    setShowKeyId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Key className="w-6 h-6" />
        <h1 className="text-2xl font-bold">API Keys</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage your API keys for accessing LLMonitor services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter API key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                disabled={creating}
              />
              <Button onClick={handleCreateKey} disabled={creating}>
                <Plus className="w-4 h-4 mr-2" />
                {creating ? "Creating..." : "Create Key"}
              </Button>
            </div>
            {createdKey && (
              <div className="bg-muted p-4 rounded-lg flex items-center gap-2">
                <span className="font-mono text-sm">{createdKey}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyKey(createdKey)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Copy and save this key now. You won't see it again.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreatedKey(null)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {loading ? (
              <div>Loading...</div>
            ) : apiKeys.length > 0 ? (
              apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {apiKey.name ?? "(no name)"}
                      </p>
                      <Badge variant="secondary">
                        {apiKey.enabled ? "Active" : "Disabled"}
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
                      Created: {new Date(apiKey.createdAt).toLocaleString()}
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
              <div className="text-muted-foreground">No API keys found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
