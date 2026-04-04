import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCheck, ChevronDown, ChevronUp, BookOpen, Terminal } from "lucide-react";
import { toast } from "sonner";

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg overflow-hidden border border-border/50">
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b border-border/40"
        style={{ background: "hsl(var(--muted)/0.5)" }}
      >
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{language}</span>
        <Button
          variant="ghost" size="icon" className="h-6 w-6 opacity-60 group-hover:opacity-100"
          onClick={handleCopy}
        >
          {copied ? <CheckCheck className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre
        className="p-3 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap"
        style={{ background: "hsl(var(--muted)/0.25)", color: "hsl(var(--foreground))" }}
      >
        {code}
      </pre>
    </div>
  );
}

function Section({
  title, children, defaultOpen = false,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/40 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/20 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

const ENDPOINT_PATH = "/api/v1/public/register";

const CURL_EXAMPLE = `curl -X POST https://YOUR_DOMAIN${ENDPOINT_PATH} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: mym_live_YOUR_PUBLIC_KEY" \\
  -H "x-api-secret: mym_secret_YOUR_APP_SECRET" \\
  -d '{
    "username": "john_doe",
    "email":    "john@example.com",
    "password": "securepassword123",
    "hwid":     "DEVICE-FINGERPRINT-XYZ"
  }'`;

const NODE_EXAMPLE = `const response = await fetch("https://YOUR_DOMAIN/api/v1/public/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key":    "mym_live_YOUR_PUBLIC_KEY",
    "x-api-secret": "mym_secret_YOUR_APP_SECRET",
  },
  body: JSON.stringify({
    username: "john_doe",
    email:    "john@example.com",
    password: "securepassword123",
    hwid:     "DEVICE-FINGERPRINT-XYZ",  // optional but recommended
  }),
});

const data = await response.json();
if (data.success) {
  console.log("Registered:", data.user.id);
  console.log("Owner:",      data.owner_id);
}`;

const PYTHON_EXAMPLE = `import requests

response = requests.post(
    "https://YOUR_DOMAIN/api/v1/public/register",
    headers={
        "x-api-key":    "mym_live_YOUR_PUBLIC_KEY",
        "x-api-secret": "mym_secret_YOUR_APP_SECRET",
    },
    json={
        "username": "john_doe",
        "email":    "john@example.com",
        "password": "securepassword123",
        "hwid":     "DEVICE-FINGERPRINT-XYZ",
    }
)
print(response.json())`;

const CSHARP_EXAMPLE = `using var client = new HttpClient();
client.DefaultRequestHeaders.Add("x-api-key",    "mym_live_YOUR_PUBLIC_KEY");
client.DefaultRequestHeaders.Add("x-api-secret", "mym_secret_YOUR_APP_SECRET");

var payload = new {
    username = "john_doe",
    email    = "john@example.com",
    password = "securepassword123",
    hwid     = "DEVICE-FINGERPRINT-XYZ"
};

var response = await client.PostAsJsonAsync(
    "https://YOUR_DOMAIN/api/v1/public/register",
    payload
);
var result = await response.Content.ReadFromJsonAsync<JsonElement>();
Console.WriteLine(result.GetProperty("user").GetProperty("id"));`;

const SUCCESS_RESPONSE = `HTTP/1.1 201 Created

{
  "success": true,
  "message": "Registration successful",
  "app":     "My Mobile App",
  "owner_id": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id":             "a3f9c2d1-...",
    "username":       "john_doe",
    "email":          "john@example.com",
    "status":         "active",
    "verified":       false,
    "credits":        0,
    "role":           "user",
    "public_api_key": "a1b2c3d4e5f6...",
    "account_expiry": "2026-05-04T12:00:00.000Z",
    "owner_id":       "550e8400-e29b-41d4-a716-446655440000",
    "registered_via_key_id": "uuid-of-your-api-key",
    "created_at":     "2026-04-04T12:00:00.000Z"
  }
}`;

const ERROR_TABLE = [
  { code: "401", error: "MISSING_CREDENTIALS", reason: "x-api-key or x-api-secret header missing" },
  { code: "401", error: "INVALID_KEY", reason: "Public API Key not found in database" },
  { code: "401", error: "INVALID_SECRET", reason: "App Secret does not match" },
  { code: "403", error: "KEY_REVOKED", reason: "This API key has been revoked" },
  { code: "400", error: "VALIDATION", reason: "Missing or invalid body fields" },
  { code: "409", error: "DUPLICATE_EMAIL", reason: "Email already registered" },
  { code: "409", error: "DUPLICATE_HWID", reason: "Device already registered" },
  { code: "429", error: "RATE_LIMITED", reason: "10+ attempts per IP in 15 minutes" },
  { code: "503", error: "MIGRATION_REQUIRED", reason: "user_api_keys table missing (run SQL migration)" },
];

export default function PublicRegisterDocs() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Public Registration Endpoint
        </CardTitle>
        <CardDescription className="text-xs">
          Your application calls this endpoint to register new users using your generated API Key pair.
          The new user is automatically linked to your Account Owner ID.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Endpoint pill */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs font-mono">POST</Badge>
          <code className="text-sm font-mono text-primary">{ENDPOINT_PATH}</code>
          <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400">
            rate-limited · 10 req / 15 min per IP
          </Badge>
        </div>

        {/* How auth works */}
        <div className="rounded-lg border border-border/40 p-3 space-y-2 text-xs">
          <p className="font-semibold text-foreground">Authentication flow</p>
          <ol className="space-y-1 list-decimal list-inside text-muted-foreground leading-relaxed">
            <li>Send <code className="text-primary font-mono">x-api-key</code> + <code className="text-primary font-mono">x-api-secret</code> in the request headers.</li>
            <li>The server looks up the Public Key in <code className="font-mono">user_api_keys</code> and verifies it is active.</li>
            <li>The App Secret is verified against the stored value.</li>
            <li>The new user is inserted into <code className="font-mono">users</code> with <code className="font-mono">owner_id</code> = your Account Owner UUID.</li>
            <li>An audit log entry is written recording which app and key were used.</li>
          </ol>
        </div>

        {/* Request body */}
        <Section title="Request body fields" defaultOpen>
          <div className="overflow-x-auto rounded-lg border border-border/40">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-left px-3 py-2 font-medium">Field</th>
                  <th className="text-left px-3 py-2 font-medium">Type</th>
                  <th className="text-left px-3 py-2 font-medium">Required</th>
                  <th className="text-left px-3 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["username", "string", "✓", "Unique display name"],
                  ["email",    "string", "✓", "Unique email address"],
                  ["password", "string", "✓", "Min 6 characters"],
                  ["hwid",     "string", "—", "Device hardware fingerprint (recommended for HWID lock)"],
                  ["role",     "string", "—", "Defaults to user. Cannot be admin."],
                ].map(([field, type, req, desc]) => (
                  <tr key={field} className="border-b border-border/20 hover:bg-muted/10">
                    <td className="px-3 py-2 font-mono text-primary">{field}</td>
                    <td className="px-3 py-2 text-muted-foreground">{type}</td>
                    <td className="px-3 py-2">{req === "✓" ? <span className="text-green-400">{req}</span> : <span className="text-muted-foreground">{req}</span>}</td>
                    <td className="px-3 py-2 text-muted-foreground">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Code examples */}
        <Section title="Code examples" defaultOpen>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Replace <code className="text-primary font-mono">YOUR_DOMAIN</code> with your deployed server URL,
              and swap in your generated key values.
            </p>
            <CodeBlock code={CURL_EXAMPLE} language="bash — cURL" />
            <CodeBlock code={NODE_EXAMPLE} language="javascript — Node.js / Browser" />
            <CodeBlock code={PYTHON_EXAMPLE} language="python" />
            <CodeBlock code={CSHARP_EXAMPLE} language="c# — .NET 6+" />
          </div>
        </Section>

        {/* Success response */}
        <Section title="Success response (201)">
          <CodeBlock code={SUCCESS_RESPONSE} language="json" />
          <div className="text-xs space-y-1 text-muted-foreground">
            <p><code className="text-primary font-mono">owner_id</code> — your Account Owner UUID (from the API key)</p>
            <p><code className="text-primary font-mono">registered_via_key_id</code> — UUID of the API key used (requires migration 002)</p>
            <p><code className="text-primary font-mono">user.public_api_key</code> — the new user's own API key (for your app's auth flow)</p>
          </div>
        </Section>

        {/* Error codes */}
        <Section title="Error codes">
          <div className="overflow-x-auto rounded-lg border border-border/40">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-left px-3 py-2 font-medium">HTTP</th>
                  <th className="text-left px-3 py-2 font-medium">error code</th>
                  <th className="text-left px-3 py-2 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {ERROR_TABLE.map(({ code, error, reason }) => (
                  <tr key={error} className="border-b border-border/20 hover:bg-muted/10">
                    <td className="px-3 py-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono ${
                          code.startsWith("2") ? "border-green-500/40 text-green-400" :
                          code.startsWith("4") ? "border-red-500/40 text-red-400" :
                          "border-amber-500/40 text-amber-400"
                        }`}
                      >
                        {code}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-mono text-amber-300 text-[10px]">{error}</td>
                    <td className="px-3 py-2 text-muted-foreground">{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Migration reminder */}
        <Section title="Database migration required (002)">
          <div className="text-xs space-y-2 text-muted-foreground">
            <p>
              To enable the <code className="text-primary font-mono">owner_id</code> and{" "}
              <code className="text-primary font-mono">registered_via_key_id</code> fields on registered users,
              run migration <code className="font-mono">002_users_owner_id.sql</code> in your Supabase SQL Editor.
            </p>
            <p className="text-amber-400">
              Without this migration, registrations still work — the user is created successfully,
              but the owner link is not stored in the users row.
            </p>
            <div className="flex items-start gap-2 rounded-md border border-border/40 bg-muted/20 p-2 font-mono">
              <Terminal className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
              <span>
                {`artifacts/api-server/migrations/002_users_owner_id.sql`}
              </span>
            </div>
          </div>
        </Section>

      </CardContent>
    </Card>
  );
}
