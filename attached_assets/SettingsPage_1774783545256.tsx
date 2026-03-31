import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Key, Eye, EyeOff, Save, Trash2, CheckCircle2, XCircle } from "lucide-react";

interface TokenConfig {
  key: string;
  label: string;
  description: string;
  placeholder: string;
}

const TOKEN_CONFIGS: TokenConfig[] = [
  {
    key: "auth_api_token",
    label: "Auth API Token",
    description: "Authentication service token (Port 3001)",
    placeholder: "Enter your Auth API token...",
  },
  {
    key: "credit_api_token",
    label: "Credit API Token",
    description: "Credit management service token (Port 3003)",
    placeholder: "Enter your Credit API token...",
  },
  {
    key: "hwid_api_token",
    label: "HWID API Token",
    description: "Hardware ID service token (Port 3002)",
    placeholder: "Enter your HWID API token...",
  },
];

function getStoredTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("api_tokens") || "{}");
  } catch {
    return {};
  }
}

function saveTokens(tokens: Record<string, string>) {
  localStorage.setItem("api_tokens", JSON.stringify(tokens));
}

export default function SettingsPage() {
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setTokens(getStoredTokens());
  }, []);

  const handleChange = (key: string, value: string) => {
    setTokens((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const toggleVisibility = (key: string) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAll = () => {
    saveTokens(tokens);
    setDirty(false);
    toast.success("All API tokens saved successfully");
  };

  const handleClear = (key: string) => {
    const updated = { ...tokens };
    delete updated[key];
    setTokens(updated);
    saveTokens(updated);
    toast.success(`${TOKEN_CONFIGS.find((t) => t.key === key)?.label} cleared`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">API Token Settings</h1>
        <p className="text-sm text-muted-foreground">
          Register your backend API tokens to connect the dashboard to live services
        </p>
      </div>

      <div className="grid gap-4">
        {TOKEN_CONFIGS.map((config) => {
          const value = tokens[config.key] || "";
          const isVisible = visibility[config.key] || false;
          const isSet = value.length > 0;

          return (
            <Card key={config.key} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{config.label}</CardTitle>
                  </div>
                  {isSet ? (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <XCircle className="h-3.5 w-3.5" /> Not set
                    </span>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {config.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={isVisible ? "text" : "password"}
                      value={value}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      placeholder={config.placeholder}
                      className="bg-secondary/50 pr-10 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => toggleVisibility(config.key)}
                    >
                      {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  {isSet && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleClear(config.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button onClick={handleSaveAll} disabled={!dirty} className="w-full sm:w-auto">
        <Save className="mr-2 h-4 w-4" />
        Save All Tokens
      </Button>
    </div>
  );
}
