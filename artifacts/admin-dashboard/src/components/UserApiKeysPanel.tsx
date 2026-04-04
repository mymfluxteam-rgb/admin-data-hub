import { useState, useEffect, useCallback } from "react";
import { userApiKeysApi, type UserApiKey } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  KeyRound, Plus, Copy, ShieldOff, Trash2, RefreshCw, CheckCheck, Eye, EyeOff,
  AlertTriangle, Terminal, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const MIGRATION_SQL = `-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,
  app_name    TEXT        NOT NULL,
  public_key  TEXT        UNIQUE NOT NULL,
  app_secret  TEXT        NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_api_keys_user_id_idx
  ON public.user_api_keys (user_id);

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "users_select_own_keys"
  ON public.user_api_keys FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "users_insert_own_keys"
  ON public.user_api_keys FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "users_update_own_keys"
  ON public.user_api_keys FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "users_delete_own_keys"
  ON public.user_api_keys FOR DELETE
  USING (auth.uid()::text = user_id);`;

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(label ? `${label} copied!` : "Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={handleCopy}
      title="Copy"
    >
      {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function MaskedSecret({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  const masked = value.slice(0, 16) + "•".repeat(20);
  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      <span className="text-muted-foreground">{visible ? value : masked}</span>
      <Button
        variant="ghost" size="icon" className="h-6 w-6 shrink-0"
        onClick={() => setVisible((v) => !v)} title={visible ? "Hide" : "Reveal"}
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </Button>
      <CopyButton value={value} label="Secret" />
    </div>
  );
}

export default function UserApiKeysPanel() {
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrationRequired, setMigrationRequired] = useState(false);

  // Generate form state
  const [appName, setAppName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [generating, setGenerating] = useState(false);

  // Newly generated key (shown in dialog — only once)
  const [newKey, setNewKey] = useState<UserApiKey | null>(null);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);

  // Revoke confirm state
  const [revokeTarget, setRevokeTarget] = useState<UserApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<UserApiKey | null>(null);
  const [deleting, setDeleting] = useState(false);

  // SQL migration dialog
  const [showSqlDialog, setShowSqlDialog] = useState(false);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetch("/api/user-api-keys");
      if (result.ok) {
        const data = await result.json() as UserApiKey[];
        setKeys(data);
        setMigrationRequired(false);
      } else {
        const err = await result.json().catch(() => ({})) as { migration_required?: boolean };
        if (err.migration_required) {
          setMigrationRequired(true);
        }
      }
    } catch {
      // ignore connection errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  const handleGenerate = async () => {
    if (!appName.trim()) { toast.error("Application name is required"); return; }
    if (!ownerId.trim()) { toast.error("Account Owner ID is required"); return; }
    setGenerating(true);
    const result = await userApiKeysApi.generate(appName.trim(), ownerId.trim());
    setGenerating(false);
    if (!result) return;

    if ((result as unknown as { migration_required?: boolean }).migration_required) {
      setMigrationRequired(true);
      return;
    }

    setNewKey(result);
    setShowNewKeyDialog(true);
    setAppName("");
    setOwnerId("");
    await loadKeys();
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    await userApiKeysApi.revoke(revokeTarget.id);
    setRevoking(false);
    setRevokeTarget(null);
    await loadKeys();
    toast.success("API key revoked");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await userApiKeysApi.delete(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    await loadKeys();
    toast.success("API key deleted");
  };

  const activeKeys = keys.filter((k) => k.is_active);
  const revokedKeys = keys.filter((k) => !k.is_active);

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Public API Key Generator
          </CardTitle>
          <CardDescription className="text-xs">
            Generate scoped public API keys and application secrets for your users. Keys use
            the existing Supabase project — no extra configuration needed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Migration required banner */}
          {migrationRequired && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/8 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-400">Database migration required</p>
                  <p className="text-xs text-muted-foreground">
                    The <code className="text-amber-400 font-mono">user_api_keys</code> table doesn't
                    exist yet in your Supabase project. Run the migration SQL to enable this feature.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                onClick={() => setShowSqlDialog(true)}
              >
                <Terminal className="h-3.5 w-3.5" /> View Migration SQL
              </Button>
            </div>
          )}

          {/* Generator form */}
          <div
            className="rounded-xl border border-border/50 p-4 space-y-4"
            style={{ background: "hsl(var(--muted)/0.3)" }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Generate New Key Pair
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="app_name" className="text-xs">Application Name</Label>
                <Input
                  id="app_name"
                  placeholder="My Mobile App"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleGenerate()}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="owner_id" className="text-xs">Account Owner ID (UUID)</Label>
                <Input
                  id="owner_id"
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleGenerate()}
                  className="h-8 text-sm font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Find user UUIDs in the Users tab.
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating || !appName.trim() || !ownerId.trim()}
              className="gap-2"
              size="sm"
            >
              {generating
                ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                : <Sparkles className="h-3.5 w-3.5" />}
              {generating ? "Generating…" : "Generate API Key"}
            </Button>
          </div>

          {/* Active keys table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Keys ({activeKeys.length})
              </p>
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={loadKeys} title="Refresh"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-md bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : activeKeys.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/50 p-6 text-center">
                <KeyRound className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No active API keys yet.</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fill in the form above to generate your first key pair.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-xs h-8">App Name</TableHead>
                      <TableHead className="text-xs h-8">Public Key</TableHead>
                      <TableHead className="text-xs h-8">Owner ID</TableHead>
                      <TableHead className="text-xs h-8">Created</TableHead>
                      <TableHead className="text-xs h-8 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeKeys.map((key) => (
                      <TableRow key={key.id} className="hover:bg-muted/20">
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/40 text-green-400 bg-green-500/8">
                              active
                            </Badge>
                            <span className="text-sm font-medium">{key.app_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1">
                            <code className="text-xs font-mono text-primary">
                              {key.public_key.slice(0, 22)}…
                            </code>
                            <CopyButton value={key.public_key} label="Public key" />
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <code className="text-xs font-mono text-muted-foreground">
                            {key.user_id.slice(0, 8)}…
                          </code>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {new Date(key.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                              onClick={() => setRevokeTarget(key)}
                              title="Revoke key"
                            >
                              <ShieldOff className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(key)}
                              title="Delete key"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Revoked keys (collapsed) */}
          {revokedKeys.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground select-none flex items-center gap-1.5">
                <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                Show {revokedKeys.length} revoked key{revokedKeys.length > 1 ? "s" : ""}
              </summary>
              <div className="mt-2 rounded-lg border border-border/30 overflow-hidden opacity-60">
                <Table>
                  <TableBody>
                    {revokedKeys.map((key) => (
                      <TableRow key={key.id} className="hover:bg-muted/10">
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-red-500/40 text-red-400 bg-red-500/8">
                              revoked
                            </Badge>
                            <span className="text-sm line-through text-muted-foreground">{key.app_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <code className="text-xs font-mono text-muted-foreground/50">
                            {key.public_key.slice(0, 22)}…
                          </code>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {new Date(key.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(key)}
                            title="Permanently delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      {/* New Key Created Dialog — shown only ONCE, secrets visible here */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-400" />
              API Key Generated Successfully
            </DialogTitle>
            <DialogDescription>
              Copy your keys now — the Application Secret will <strong>never be shown again</strong>.
            </DialogDescription>
          </DialogHeader>

          {newKey && (
            <div className="space-y-4 mt-2">
              <div
                className="rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-xs text-amber-400 flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Save your Application Secret securely. It cannot be retrieved later.
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Application Name</Label>
                  <p className="text-sm font-medium">{newKey.app_name}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Account Owner ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-muted-foreground">{newKey.user_id}</code>
                    <CopyButton value={newKey.user_id} label="Owner ID" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Public API Key</Label>
                  <div
                    className="flex items-center gap-2 rounded-md border border-border/50 px-3 py-2"
                    style={{ background: "hsl(var(--muted)/0.3)" }}
                  >
                    <code className="text-xs font-mono text-primary flex-1 break-all">{newKey.public_key}</code>
                    <CopyButton value={newKey.public_key} label="Public key" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Application Secret</Label>
                  <div
                    className="flex items-center gap-2 rounded-md border border-amber-500/30 px-3 py-2"
                    style={{ background: "hsl(var(--muted)/0.2)" }}
                  >
                    <code className="text-xs font-mono text-amber-300 flex-1 break-all">
                      {newKey.app_secret}
                    </code>
                    <CopyButton value={newKey.app_secret ?? ""} label="App secret" />
                  </div>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                onClick={() => setShowNewKeyDialog(false)}
              >
                <CheckCheck className="h-4 w-4" />
                I've saved my keys — close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation */}
      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Revoking <strong>{revokeTarget?.app_name}</strong> will immediately disable it.
              Any application using this key will lose access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleRevoke}
              disabled={revoking}
            >
              {revoking && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the key for <strong>{deleteTarget?.app_name}</strong>{" "}
              and all associated records. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Migration SQL Dialog */}
      <Dialog open={showSqlDialog} onOpenChange={setShowSqlDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Database Migration SQL
            </DialogTitle>
            <DialogDescription>
              Copy this SQL and run it in your{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Supabase SQL Editor
              </a>{" "}
              to create the <code>user_api_keys</code> table.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-2">
            <pre
              className="rounded-lg border border-border/50 bg-muted/40 p-4 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto"
            >
              {MIGRATION_SQL}
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 gap-1.5 text-xs h-7"
              onClick={async () => {
                await navigator.clipboard.writeText(MIGRATION_SQL);
                toast.success("SQL copied to clipboard!");
              }}
            >
              <Copy className="h-3 w-3" /> Copy SQL
            </Button>
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              className="flex-1 gap-2"
              onClick={async () => {
                setShowSqlDialog(false);
                await loadKeys();
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Done — Refresh Status
            </Button>
            <Button variant="outline" onClick={() => setShowSqlDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add key dialog trigger at bottom if migration needed */}
      {!migrationRequired && !loading && (
        <div className="flex justify-end gap-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setShowSqlDialog(true)}
          >
            <Terminal className="h-3.5 w-3.5" /> View Migration SQL
          </Button>
        </div>
      )}
    </>
  );
}
