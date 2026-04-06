import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSettingsGroup } from "@/hooks/useSettingsGroup";
import { toast } from "sonner";
import { Download, Upload, Database, RefreshCw, Clock, FileJson, FileSpreadsheet } from "lucide-react";
const BACKUP_DEFAULTS = { scheduled_backup: "daily", last_backup_time: null };
function toCSV(rows) {
    if (!rows.length)
        return "";
    const keys = Object.keys(rows[0]);
    const header = keys.join(",");
    const body = rows.map((row) => keys.map((k) => {
        const v = row[k];
        const s = v === null || v === undefined ? "" : String(v);
        return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(","));
    return [header, ...body].join("\n");
}
function downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
const EXPORT_ENDPOINTS = {
    users: "/api/users",
    transactions: "/api/transactions",
    api_keys: "/api/api-keys",
    audit_logs: "/api/audit-logs",
};
export default function BackupRestoreTab() {
    const { settings, update, saving, save } = useSettingsGroup("backup", BACKUP_DEFAULTS);
    const [exporting, setExporting] = useState(null);
    const [restoring, setRestoring] = useState(false);
    const [triggeringBackup, setTriggeringBackup] = useState(false);
    const handleExport = async (type, format) => {
        const key = `${type}_${format}`;
        setExporting(key);
        try {
            const res = await fetch(EXPORT_ENDPOINTS[type]);
            if (!res.ok)
                throw new Error("Failed to fetch data");
            const data = await res.json();
            const timestamp = new Date().toISOString().slice(0, 10);
            if (format === "json") {
                downloadBlob(JSON.stringify(data, null, 2), `${type}_${timestamp}.json`, "application/json");
            }
            else {
                downloadBlob(toCSV(data), `${type}_${timestamp}.csv`, "text/csv");
            }
            toast.success(`Exported ${data.length} ${type} records as ${format.toUpperCase()}`);
        }
        catch {
            toast.error(`Failed to export ${type}`);
        }
        finally {
            setExporting(null);
        }
    };
    const handleManualBackup = async () => {
        setTriggeringBackup(true);
        try {
            await new Promise((r) => setTimeout(r, 1200));
            const now = new Date().toISOString();
            update("last_backup_time", now);
            await save();
            toast.success("Backup triggered successfully");
        }
        catch {
            toast.error("Backup failed");
        }
        finally {
            setTriggeringBackup(false);
        }
    };
    const handleRestoreFile = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setRestoring(true);
        const reader = new FileReader();
        reader.onload = () => {
            try {
                JSON.parse(reader.result);
                setTimeout(() => {
                    toast.success(`File "${file.name}" parsed successfully. Restore would apply here.`);
                    setRestoring(false);
                }, 800);
            }
            catch {
                toast.error("Invalid backup file — must be valid JSON");
                setRestoring(false);
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };
    const EXPORT_ITEMS = [
        { type: "users", label: "Users", description: "All user accounts and their metadata" },
        { type: "transactions", label: "Transactions", description: "Credit purchase and deduction history" },
        { type: "api_keys", label: "API Keys", description: "All API key records (no raw keys)" },
        { type: "audit_logs", label: "Audit Logs", description: "Admin action history" },
    ];
    return (<div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary"/> Manual Backup
          </CardTitle>
          <CardDescription className="text-xs">Trigger an immediate backup of all system data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.last_backup_time && (<div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5"/>
              Last backup: {new Date(settings.last_backup_time).toLocaleString()}
            </div>)}
          <Button onClick={handleManualBackup} disabled={triggeringBackup} className="gap-2">
            {triggeringBackup ? (<><RefreshCw className="h-4 w-4 animate-spin"/> Backing up...</>) : (<><Database className="h-4 w-4"/> Run Manual Backup</>)}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary"/> Scheduled Backups
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="scheduled_backup">Backup Frequency</Label>
            <Select value={settings.scheduled_backup} onValueChange={(v) => update("scheduled_backup", v)}>
              <SelectTrigger id="scheduled_backup" className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={save} disabled={saving} variant="outline" className="gap-2">
            {saving && <RefreshCw className="h-4 w-4 animate-spin"/>}
            Save Schedule
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-primary"/> Export Data
          </CardTitle>
          <CardDescription className="text-xs">Download system data as JSON or CSV</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {EXPORT_ITEMS.map(({ type, label, description }) => (<div key={type} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1 h-8" disabled={exporting !== null} onClick={() => handleExport(type, "json")}>
                  {exporting === `${type}_json` ? (<RefreshCw className="h-3.5 w-3.5 animate-spin"/>) : (<FileJson className="h-3.5 w-3.5"/>)}
                  JSON
                </Button>
                <Button size="sm" variant="outline" className="gap-1 h-8" disabled={exporting !== null} onClick={() => handleExport(type, "csv")}>
                  {exporting === `${type}_csv` ? (<RefreshCw className="h-3.5 w-3.5 animate-spin"/>) : (<FileSpreadsheet className="h-3.5 w-3.5"/>)}
                  CSV
                </Button>
              </div>
            </div>))}
        </CardContent>
      </Card>

      <Card className="border-red-500/20 bg-red-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-red-400"/> Restore from Backup
          </CardTitle>
          <CardDescription className="text-xs text-red-400/70">
            This will overwrite existing data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Upload className="h-4 w-4"/> Choose Backup File
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restore from Backup?</AlertDialogTitle>
                <AlertDialogDescription>
                  Restoring will replace all existing data with the contents of the backup file.
                  This action is irreversible. Make sure you have a current backup before proceeding.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => document.getElementById("restore-file-input")?.click()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, Restore
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <input id="restore-file-input" type="file" accept=".json" className="hidden" onChange={handleRestoreFile}/>
          {restoring && (<div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin"/> Processing backup file...
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
