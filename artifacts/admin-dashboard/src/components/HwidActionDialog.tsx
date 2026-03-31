import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Cpu } from "lucide-react";
import { toast } from "sonner";
import { hwidsApi } from "@/lib/api";

export function HwidActionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hwidId, setHwidId] = useState("");
  const [action, setAction] = useState<"blacklist" | "delete">("blacklist");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = action === "delete"
      ? await hwidsApi.delete(hwidId)
      : await hwidsApi.setBlacklist(hwidId, true);
    setLoading(false);
    if (ok) {
      toast.success(`${action === "delete" ? "Deleted" : "Blacklisted"} HWID record`);
      setOpen(false);
      setHwidId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
          <Cpu className="h-3.5 w-3.5" />
          HWID
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>HWID Action</DialogTitle>
          <DialogDescription>Blacklist or delete a hardware device by its row ID.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Action</Label>
            <div className="flex gap-2">
              <Button type="button" variant={action === "blacklist" ? "default" : "outline"} size="sm"
                onClick={() => setAction("blacklist")}>Blacklist</Button>
              <Button type="button" variant={action === "delete" ? "destructive" : "outline"} size="sm"
                onClick={() => setAction("delete")}>Delete</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hwidId">HWID Row ID (UUID)</Label>
            <Input id="hwidId" value={hwidId}
              onChange={(e) => setHwidId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}
              variant={action === "delete" ? "destructive" : "default"}>
              {loading ? "Processing..." : action === "delete" ? "Delete" : "Blacklist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
