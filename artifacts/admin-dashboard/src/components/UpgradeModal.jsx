import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function UpgradeModal({ open, onClose, featureName }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <DialogTitle>Upgrade Required</DialogTitle>
                    </div>
                    <DialogDescription>
                        {featureName
                            ? `"${featureName}" is an advanced feature`
                            : "This is an advanced feature"}{" "}
                        not available on your current plan. Upgrade your plan to unlock it.
                    </DialogDescription>
                </DialogHeader>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">What you'll get with an upgrade:</p>
                    <ul className="space-y-1 list-disc list-inside">
                        <li>More applications and license slots</li>
                        <li>Access to Audit Logs</li>
                        <li>Advanced HWID management</li>
                        <li>Priority support</li>
                    </ul>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Maybe Later
                    </Button>
                    <Button onClick={onClose}>
                        Upgrade Plan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
