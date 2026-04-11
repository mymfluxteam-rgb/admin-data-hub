import { Lock, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * A drop-in replacement for a settings row that is locked behind a plan upgrade.
 * Shows the toggle disabled and an "Upgrade to Pro" badge.
 */
export function PlanLockedRow({ label, description, value }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center justify-between py-2 opacity-60 cursor-not-allowed select-none">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{label}</p>
                                <Badge
                                    variant="outline"
                                    className="gap-1 text-[10px] px-1.5 py-0 h-4 border-amber-400/60 text-amber-500 bg-amber-500/10 shrink-0"
                                >
                                    <Zap className="h-2.5 w-2.5" />
                                    Upgrade to Pro
                                </Badge>
                            </div>
                            {description && (
                                <p className="text-xs text-muted-foreground">{description}</p>
                            )}
                        </div>
                        <Switch checked={!!value} disabled className="ml-4 shrink-0" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-[220px] text-center">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Lock className="h-3 w-3" />
                        <span className="font-medium">Pro Feature</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        This setting is not available on your current plan. Upgrade to unlock it.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/**
 * Wraps an input field that is locked behind a plan upgrade.
 */
export function PlanLockedField({ label, description, children }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="space-y-2 opacity-60 cursor-not-allowed select-none">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">{label}</label>
                            <Badge
                                variant="outline"
                                className="gap-1 text-[10px] px-1.5 py-0 h-4 border-amber-400/60 text-amber-500 bg-amber-500/10 shrink-0"
                            >
                                <Zap className="h-2.5 w-2.5" />
                                Upgrade to Pro
                            </Badge>
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                        <div className="pointer-events-none">{children}</div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[220px] text-center">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Lock className="h-3 w-3" />
                        <span className="font-medium">Pro Feature</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        This setting is not available on your current plan. Upgrade to unlock it.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
