import { useEffect, useState } from "react";
import { hwidsApi, type HWID } from "@/lib/api";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Trash2, ShieldBan, Timer, ShieldX, ShieldCheck,
  Monitor, Smartphone, Mail, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

type ActionType = "blacklist" | "unblacklist" | "manual-block" | "unblock" | "delete";

interface PendingAction {
  hwid: HWID;
  type: ActionType;
}

function DeviceIcon({ type }: { type?: string | null }) {
  if (type === "mobile") return <Smartphone className="h-3.5 w-3.5 text-blue-400" />;
  return <Monitor className="h-3.5 w-3.5 text-muted-foreground" />;
}

function RestrictionBadge({ h }: { h: HWID }) {
  if (!h.restriction_type) return null;
  if (h.restriction_type === "manual_block") {
    return <span className="text-xs text-red-400 font-medium block">Manual Block</span>;
  }
  if (h.restriction_type === "time_limit" && h.restriction_end_time) {
    const remaining = new Date(h.restriction_end_time).getTime() - Date.now();
    if (remaining <= 0) return <span className="text-xs text-muted-foreground block">Restriction expired</span>;
    const totalMins = Math.ceil(remaining / 60000);
    const h_ = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const label = h_ > 0 ? `${h_}h ${m}m left` : `${m}m left`;
    return <span className="text-xs text-orange-400 font-medium block">{label}</span>;
  }
  return null;
}

function EmailConfirmDialog({
  action,
  onConfirm,
  onCancel,
}: {
  action: PendingAction;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const labels: Record<ActionType, { title: string; desc: string; color: string }> = {
    "blacklist":    { title: "Blacklist Device", desc: "This will prevent the device from authenticating.", color: "text-yellow-400" },
    "unblacklist":  { title: "Remove Blacklist", desc: "This will allow the device to authenticate again.", color: "text-emerald-400" },
    "manual-block": { title: "Manually Block Device", desc: "This will immediately block the device from logging in.", color: "text-red-400" },
    "unblock":      { title: "Remove Restriction", desc: "This will remove all restrictions from the device.", color: "text-emerald-400" },
    "delete":       { title: "Delete Device", desc: "This will permanently remove the device record.", color: "text-red-400" },
  };
  const info = labels[action.type];
  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${info.color}`}>
            <AlertTriangle className="h-4 w-4" /> {info.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{info.desc}</p>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Device ID</p>
              <p className="font-mono text-xs font-medium mt-0.5">{action.hwid.device_id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Associated Account</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium">{action.hwid.user_email ?? action.hwid.user_id}</span>
              </div>
            </div>
            {action.hwid.browser && (
              <div>
                <p className="text-xs text-muted-foreground">Browser / OS</p>
                <p className="text-xs mt-0.5">{action.hwid.browser} · {action.hwid.os ?? "—"}</p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Confirm the email above before proceeding.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm"
            className={action.type === "delete" || action.type === "manual-block" ? "bg-destructive hover:bg-destructive/90" : ""}
            onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function HWIDsPage() {
  const [hwids, setHwids] = useState<HWID[]>([]);
  const [loading, setLoading] = useState(true);

  const [restrictTarget, setRestrictTarget] = useState<HWID | null>(null);
  const [rHours, setRHours] = useState("1");
  const [rMinutes, setRMinutes] = useState("0");

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const fetchHwids = () => {
    setLoading(true);
    hwidsApi.getAll().then(setHwids).finally(() => setLoading(false));
  };

  useEffect(() => { fetchHwids(); }, []);

  const confirmAction = (hwid: HWID, type: ActionType) => {
    setPendingAction({ hwid, type });
  };

  const executeAction = async () => {
    if (!pendingAction) return;
    const { hwid, type } = pendingAction;
    setPendingAction(null);
    let ok: unknown = null;

    if (type === "delete") {
      await hwidsApi.delete(hwid.id);
      toast.success(`Deleted ${hwid.device_id}`);
      setHwids((p) => p.filter((x) => x.id !== hwid.id));
      return;
    }
    if (type === "blacklist") ok = await hwidsApi.setBlacklist(hwid.id, true);
    if (type === "unblacklist") ok = await hwidsApi.setBlacklist(hwid.id, false);
    if (type === "manual-block") ok = await hwidsApi.manualBlock(hwid.id);
    if (type === "unblock") ok = await hwidsApi.unblock(hwid.id);

    if (ok) {
      const msgs: Record<ActionType, string> = {
        "blacklist": "Device blacklisted",
        "unblacklist": "Blacklist removed",
        "manual-block": "Device manually blocked",
        "unblock": "Device restriction removed",
        "delete": "",
      };
      toast.success(msgs[type]);
      fetchHwids();
    }
  };

  const handleRestrict = async () => {
    if (!restrictTarget) return;
    const h = parseInt(rHours) || 0;
    const m = parseInt(rMinutes) || 0;
    if (h === 0 && m === 0) {
      toast.error("Set at least 1 minute");
      return;
    }
    const ok = await hwidsApi.restrict(restrictTarget.id, h, m, 0);
    if (ok) {
      toast.success(`Login blocked for ${h}h ${m}m on device ${restrictTarget.device_id}`);
      setRestrictTarget(null);
      fetchHwids();
    }
  };

  const columns = [
    {
      key: "device_id", label: "Device ID",
      render: (h: HWID) => (
        <div className="flex items-center gap-1.5">
          <DeviceIcon type={h.device_type} />
          <span className="font-mono text-xs">{h.device_id}</span>
        </div>
      ),
    },
    {
      key: "user", label: "User (Email)",
      render: (h: HWID) => (
        <div className="flex items-center gap-1.5">
          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-sm">{h.user_email ?? h.user_id}</span>
        </div>
      ),
    },
    {
      key: "device_info", label: "Device Info",
      render: (h: HWID) => (
        <div className="text-xs text-muted-foreground space-y-0.5">
          {h.browser && <div>{h.browser}</div>}
          {h.os && <div>{h.os}</div>}
          {!h.browser && !h.os && <div className="text-muted-foreground/60">{h.device_name ?? "—"}</div>}
        </div>
      ),
    },
    {
      key: "status", label: "Status",
      render: (h: HWID) => (
        <div className="space-y-0.5">
          <StatusBadge status={h.blacklisted ? "blacklisted" : "active"} />
          <RestrictionBadge h={h} />
        </div>
      ),
    },
    { key: "last_seen", label: "Last Seen", render: (h: HWID) => <span className="text-xs text-muted-foreground">{new Date(h.last_seen).toLocaleDateString()}</span> },
    {
      key: "actions", label: "Actions",
      render: (h: HWID) => (
        <div className="flex gap-1 flex-wrap">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Delete device" onClick={() => confirmAction(h, "delete")}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon"
            className={`h-7 w-7 text-muted-foreground ${h.blacklisted ? "hover:text-emerald-400" : "hover:text-yellow-400"}`}
            title={h.blacklisted ? "Remove blacklist" : "Blacklist"}
            onClick={() => confirmAction(h, h.blacklisted ? "unblacklist" : "blacklist")}>
            <ShieldBan className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-orange-400"
            title="Set login time restriction (H:M)"
            onClick={() => { setRestrictTarget(h); setRHours("1"); setRMinutes("0"); }}>
            <Timer className="h-3.5 w-3.5" />
          </Button>
          {h.restriction_type ? (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-emerald-400"
              title="Remove all restrictions" onClick={() => confirmAction(h, "unblock")}>
              <ShieldCheck className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-400"
              title="Manual block" onClick={() => confirmAction(h, "manual-block")}>
              <ShieldX className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">HWID Management</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `${hwids.length} devices registered`}
        </p>
      </div>

      <DataTable
        data={hwids as unknown as Record<string, unknown>[]}
        columns={columns as Parameters<typeof DataTable>[0]["columns"]}
        searchKey="device_id" searchPlaceholder="Search by device ID..." isLoading={loading}
      />

      {pendingAction && (
        <EmailConfirmDialog
          action={pendingAction}
          onConfirm={executeAction}
          onCancel={() => setPendingAction(null)}
        />
      )}

      <Dialog open={!!restrictTarget} onOpenChange={(o) => !o && setRestrictTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-orange-400" /> Set Login Time Restriction
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Blocking login on device</p>
              <p className="font-mono text-xs font-medium">{restrictTarget?.device_id}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Mail className="h-3 w-3" />
                <span>{restrictTarget?.user_email ?? restrictTarget?.user_id}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              The device will be prevented from logging in for the specified duration starting now.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Hours</Label>
                <Input type="number" min={0} max={99} value={rHours}
                  onChange={(e) => setRHours(e.target.value)} className="mt-1 font-mono" />
              </div>
              <div>
                <Label className="text-xs">Minutes</Label>
                <Input type="number" min={0} max={59} value={rMinutes}
                  onChange={(e) => setRMinutes(e.target.value)} className="mt-1 font-mono" />
              </div>
            </div>

            {(parseInt(rHours) > 0 || parseInt(rMinutes) > 0) && (
              <p className="text-xs text-muted-foreground">
                Login blocked until:{" "}
                <span className="text-foreground font-medium">
                  {new Date(Date.now() + ((parseInt(rHours) || 0) * 3600 + (parseInt(rMinutes) || 0) * 60) * 1000).toLocaleString()}
                </span>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRestrictTarget(null)}>Cancel</Button>
            <Button size="sm" onClick={handleRestrict}>Apply Restriction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
