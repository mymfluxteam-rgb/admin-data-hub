import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { Copy, Check, Code2, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SDK_LANGUAGES, SDK_EXAMPLES } from "@/constants/sdkExamples";

function CopyButton({ code }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
            {copied ? (
                <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
            ) : (
                <><Copy className="h-3.5 w-3.5" /> Copy</>
            )}
        </Button>
    );
}

export default function SdkPage() {
    const [activeId, setActiveId] = useState(SDK_LANGUAGES[0].id);

    const active = SDK_LANGUAGES.find((l) => l.id === activeId);
    const code = SDK_EXAMPLES[activeId] ?? "";

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Code2 className="h-6 w-6 text-primary" />
                        Developer SDK
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Ready-to-use integration examples for verifying licenses in your application.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-card p-4 flex gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Endpoint</p>
                        <code className="text-xs text-muted-foreground font-mono">POST /api/v1/verify</code>
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 flex gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Required Fields</p>
                        <code className="text-xs text-muted-foreground font-mono">app_id · app_secret · license_key</code>
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 flex gap-3">
                    <div className="h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">Response</p>
                        <code className="text-xs text-muted-foreground font-mono">{"{ valid, message, license, app }"}</code>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 min-h-0">
                <div className="w-44 shrink-0 space-y-0.5">
                    {SDK_LANGUAGES.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => setActiveId(lang.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                activeId === lang.id
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 min-w-0 rounded-lg border border-border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
                        <span className="text-sm font-medium text-foreground">{active?.label}</span>
                        <CopyButton code={code} />
                    </div>
                    <SyntaxHighlighter
                        language={active?.highlight ?? "plaintext"}
                        style={vscDarkPlus}
                        showLineNumbers
                        wrapLongLines={false}
                        customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            fontSize: "0.78rem",
                            lineHeight: "1.6",
                            background: "hsl(var(--background))",
                            maxHeight: "calc(100vh - 280px)",
                            overflowY: "auto",
                        }}
                        lineNumberStyle={{
                            minWidth: "2.5em",
                            paddingRight: "1em",
                            color: "hsl(var(--muted-foreground) / 0.4)",
                            userSelect: "none",
                        }}
                    >
                        {code}
                    </SyntaxHighlighter>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground mb-2">API Response Structure</p>
                <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        background: "hsl(var(--muted))",
                    }}
                >
{`{
  "valid": true,
  "message": "License key is valid",
  "license": {
    "id": "uuid",
    "license_key": "XXXX-XXXX-XXXX-XXXX",
    "status": "active",
    "user_label": "Customer Name",
    "expires_at": null,
    "created_at": "2026-01-01T00:00:00Z"
  },
  "app": {
    "id": "your-app-id",
    "app_name": "My Application"
  }
}`}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
