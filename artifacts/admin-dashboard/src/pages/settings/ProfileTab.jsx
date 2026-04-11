import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/contexts/UserPlanContext";
import { subscriptionApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Zap, Monitor, KeyRound, AppWindow, Shield } from "lucide-react";

function GoogleIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9574A8.9961 8.9961 0 0 0 0 9c0 1.4523.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
            <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
        </svg>
    );
}

function GitHubIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
    );
}

const PLAN_META = {
    tester: {
        label: "Tester",
        color: "border-zinc-400/40 bg-zinc-500/5 text-zinc-400",
        badge: "border-zinc-400/40 text-zinc-400",
        limits: [
            { icon: AppWindow, label: "Applications", value: "1" },
            { icon: KeyRound, label: "License Keys", value: "10" },
            { icon: Monitor, label: "HWID Locking", value: "Basic" },
            { icon: Shield, label: "2FA / IP Controls", value: "Locked" },
        ],
    },
    basic: {
        label: "Basic",
        color: "border-blue-400/40 bg-blue-500/5 text-blue-400",
        badge: "border-blue-400/40 text-blue-400",
        limits: [
            { icon: AppWindow, label: "Applications", value: "3" },
            { icon: KeyRound, label: "License Keys", value: "50" },
            { icon: Monitor, label: "HWID Locking", value: "Standard" },
            { icon: Shield, label: "2FA / IP Controls", value: "Partial" },
        ],
    },
    pro: {
        label: "Pro",
        color: "border-primary/40 bg-primary/5 text-primary",
        badge: "border-primary/40 text-primary",
        limits: [
            { icon: AppWindow, label: "Applications", value: "Unlimited" },
            { icon: KeyRound, label: "License Keys", value: "Unlimited" },
            { icon: Monitor, label: "HWID Locking", value: "Advanced" },
            { icon: Shield, label: "2FA / IP Controls", value: "Full Access" },
        ],
    },
    enterprise: {
        label: "Enterprise",
        color: "border-purple-400/40 bg-purple-500/5 text-purple-400",
        badge: "border-purple-400/40 text-purple-400",
        limits: [
            { icon: AppWindow, label: "Applications", value: "Unlimited" },
            { icon: KeyRound, label: "License Keys", value: "Unlimited" },
            { icon: Monitor, label: "HWID Locking", value: "Enterprise" },
            { icon: Shield, label: "2FA / IP Controls", value: "Full Access" },
        ],
    },
};

function getPlanKey(planId) {
    if (!planId) return "tester";
    const key = planId.toLowerCase().trim();
    if (key.includes("enterprise")) return "enterprise";
    if (key.includes("pro") || key.includes("business")) return "pro";
    if (key.includes("basic") || key.includes("starter")) return "basic";
    return "tester";
}

function ProviderBadge({ provider }) {
    if (provider === "google") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border" style={{ background: "#fff1f1", border: "1px solid #fecaca", color: "#c0392b" }}>
                <GoogleIcon /> Google
            </span>
        );
    }
    if (provider === "github") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border border-border bg-muted text-foreground">
                <GitHubIcon /> GitHub
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground capitalize">
            {provider}
        </span>
    );
}

export default function ProfileTab() {
    const { user } = useAuth();
    const { plan } = useUserPlan();
    const [subscription, setSubscription] = useState(null);
    const [loadingSub, setLoadingSub] = useState(true);

    useEffect(() => {
        subscriptionApi.getMine()
            .then(setSubscription)
            .finally(() => setLoadingSub(false));
    }, []);

    const meta = user?.user_metadata ?? {};
    const name = meta.full_name || meta.name || user?.email?.split("@")[0] || "User";
    const email = user?.email ?? "";
    const avatarUrl = meta.avatar_url || meta.picture || null;
    const provider = user?.app_metadata?.provider ?? "email";

    const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const rawPlanId = subscription?.plan_id ?? plan.planName ?? null;
    const planKey = getPlanKey(rawPlanId);
    const planMeta = PLAN_META[planKey];
    const isFullAccess = planKey === "pro" || planKey === "enterprise";
    const subStatus = subscription?.status ?? "active";

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-base font-semibold text-foreground">Your Profile</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Account information and current subscription plan.
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-5">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/30 shrink-0"
                    />
                ) : (
                    <div
                        className="h-16 w-16 rounded-full flex items-center justify-center shrink-0 text-lg font-bold"
                        style={{ background: "linear-gradient(135deg, #0ea5e9, #06b6d4)", color: "#fff" }}
                    >
                        {initials}
                    </div>
                )}
                <div className="flex-1 min-w-0 space-y-1.5">
                    <p className="text-base font-semibold text-foreground truncate">{name}</p>
                    <p className="text-sm text-muted-foreground truncate">{email}</p>
                    <div className="flex items-center gap-2 pt-0.5">
                        <ProviderBadge provider={provider} />
                        <span className="text-xs text-muted-foreground">
                            Signed in via {provider === "google" ? "Google" : provider === "github" ? "GitHub" : "Email"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Subscription Plan</h3>
                    {loadingSub ? (
                        <Skeleton className="h-5 w-20" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`text-xs font-semibold px-2.5 py-0.5 ${planMeta.badge}`}
                            >
                                {planMeta.label}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`text-xs capitalize ${
                                    subStatus === "active"
                                        ? "border-emerald-400/40 text-emerald-400"
                                        : "border-zinc-400/40 text-zinc-400"
                                }`}
                            >
                                {subStatus}
                            </Badge>
                        </div>
                    )}
                </div>

                {loadingSub ? (
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {planMeta.limits.map(({ icon: Icon, label, value }) => (
                            <div
                                key={label}
                                className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-3"
                            >
                                <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="text-sm font-medium text-foreground">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 mt-2 ${planMeta.color}`}>
                    {isFullAccess ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                        <Zap className="h-4 w-4 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">
                            {isFullAccess
                                ? "You have full access to all features."
                                : "Upgrade to Pro to unlock advanced HWID locking, 2FA enforcement, IP controls, and more."}
                        </p>
                    </div>
                    {!isFullAccess && (
                        <Badge
                            variant="outline"
                            className="shrink-0 text-xs border-amber-400/60 text-amber-500 bg-amber-500/10"
                        >
                            <Zap className="h-3 w-3 mr-1" />
                            Upgrade
                        </Badge>
                    )}
                </div>

                {!loadingSub && (
                    <div className="pt-1 border-t border-border">
                        <div className="flex justify-between text-xs text-muted-foreground mt-3">
                            <span>Applications used</span>
                            <span className="font-medium text-foreground">
                                {plan.currentApplications ?? 0}
                                {plan.maxApplications != null ? ` / ${plan.maxApplications}` : " / ∞"}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>License keys used</span>
                            <span className="font-medium text-foreground">
                                {plan.currentLicenses ?? 0}
                                {plan.licensedUsers != null ? ` / ${plan.licensedUsers}` : " / ∞"}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
