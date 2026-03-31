import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Server, RefreshCw, Key, ShieldCheck, User } from "lucide-react";
import { usersApi, type User as UserType } from "@/lib/api";
import { toast } from "sonner";

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

const ENDPOINTS = [
  { label: "Users", path: "/api/users" },
  { label: "Transactions", path: "/api/transactions" },
  { label: "HWIDs", path: "/api/hwids" },
  { label: "Sessions", path: "/api/sessions" },
  { label: "Audit Logs", path: "/api/audit-logs" },
  { label: "Metrics", path: "/api/metrics" },
] as const;

interface EndpointStatus {
  label: string;
  path: string;
  ok: boolean | null;
  status: number | null;
  latency: number | null;
}

export default function SettingsPage() {
  const [statuses, setStatuses] = useState<EndpointStatus[]>(
    ENDPOINTS.map((e) => ({ ...e, ok: null, status: null, latency: null }))
  );
  const [checking, setChecking] = useState(false);
  const [jwtToken, setJwtToken] = useState(() => localStorage.getItem("admin_jwt") ?? "");

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<UserType | null>(null);
  const [verifyFailed, setVerifyFailed] = useState(false);

  const checkEndpoints = async () => {
    setChecking(true);
    const token = localStorage.getItem("admin_jwt");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const results = await Promise.all(
      ENDPOINTS.map(async (ep) => {
        const start = Date.now();
        try {
          const res = await fetch(`${BASE_URL}${ep.path}`, { headers });
          return { ...ep, ok: res.ok, status: res.status, latency: Date.now() - start };
        } catch {
          return { ...ep, ok: false, status: null, latency: null };
        }
      })
    );
    setStatuses(results);
    setChecking(false);
  };

  useEffect(() => { checkEndpoints(); }, []);

  const handleSaveToken = () => {
    if (jwtToken.trim()) {
      localStorage.setItem("admin_jwt", jwtToken.trim());
      toast.success("JWT token saved — re-checking endpoints...");
      setTimeout(() => checkEndpoints(), 300);
    } else {
      localStorage.removeItem("admin_jwt");
      toast.success("JWT token cleared");
    }
  };

  const handleVerifyApiKey = async () => {
    if (!apiKeyInput.trim()) {
      toast.error("Enter an API key to verify");
      return;
    }
    setVerifying(true);
    setVerifiedUser(null);
    setVerifyFailed(false);
    const result = await usersApi.verifyApiKey(apiKeyInput.trim());
    setVerifying(false);
    if (result?.valid && result.user) {
      setVerifiedUser(result.user);
      setVerifyFailed(false);
      toast.success(`Verified: ${result.user.email}`);
    } else {
      setVerifyFailed(true);
      setVerifiedUser(null);
    }
  };

  const allOk = statuses.length > 0 && statuses.every((s) => s.ok === true);
  const anyFailed = statuses.some((s) => s.ok === false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Backend connection, API key verification, and JWT configuration</p>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">API Key Verification</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Verify a user's registration API key to look up their account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key-verify">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key-verify"
                type="text"
                value={apiKeyInput}
                onChange={(e) => { setApiKeyInput(e.target.value); setVerifiedUser(null); setVerifyFailed(false); }}
                placeholder="Paste 32-character API key..."
                className="font-mono text-sm bg-secondary/50 flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleVerifyApiKey()}
              />
              <Button onClick={handleVerifyApiKey} disabled={verifying} size="sm" className="shrink-0">
                {verifying ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                )}
                Verify
              </Button>
            </div>
          </div>

          {verifiedUser && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Account verified</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Username</p>
                  <p className="font-mono font-medium">{verifiedUser.username}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="font-medium">{verifiedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                  <p className="capitalize font-medium">{verifiedUser.status}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Role</p>
                  <p className="capitalize">{verifiedUser.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Credits</p>
                  <p className="font-mono">{(verifiedUser.credits ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Verified</p>
                  <p>{verifiedUser.verified ? "Yes" : "No"}</p>
                </div>
                {verifiedUser.account_expiry && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Account Expiry</p>
                    <p>{new Date(verifiedUser.account_expiry).toLocaleString()}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-0.5">User ID</p>
                  <p className="font-mono text-xs text-muted-foreground">{verifiedUser.id}</p>
                </div>
              </div>
            </div>
          )}

          {verifyFailed && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-400">No account found for this API key</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Backend API</CardTitle>
            </div>
            {allOk && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> All endpoints reachable</span>}
            {anyFailed && !allOk && <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="h-3.5 w-3.5" /> Some endpoints failed</span>}
          </div>
          <CardDescription className="font-mono text-xs">{BASE_URL}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {statuses.map((s) => (
            <div key={s.path} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2">
                {s.ok === null ? (
                  <div className="h-4 w-4 rounded-full border-2 border-muted animate-pulse" />
                ) : s.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className="text-sm">{s.label}</span>
                <span className="font-mono text-xs text-muted-foreground">{s.path}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {s.status && (
                  <span className={s.ok ? "text-emerald-400" : "text-red-400"}>{s.status}</span>
                )}
                {s.latency !== null && <span>{s.latency}ms</span>}
                {s.ok === false && s.status === null && <span className="text-red-400">unreachable</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={checkEndpoints} disabled={checking} variant="outline" className="gap-2">
        <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
        {checking ? "Checking..." : "Re-check Endpoints"}
      </Button>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">JWT Token</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Stored in localStorage and sent as{" "}
            <code className="font-mono bg-muted px-1 rounded">Authorization: Bearer ...</code> with every request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="jwt">Token</Label>
            <Input
              id="jwt"
              type="password"
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              placeholder="Paste your JWT token here..."
              className="font-mono text-sm bg-secondary/50"
            />
          </div>
          <Button onClick={handleSaveToken} size="sm">Save Token</Button>
        </CardContent>
      </Card>

      <div className="glass-card rounded-lg p-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Environment</p>
        <div className="space-y-1 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">VITE_API_URL</span>
            <span className="text-foreground">{BASE_URL}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">API Base</span>
            <span className="text-foreground">/api</span>
          </div>
        </div>
      </div>
    </div>
  );
}
