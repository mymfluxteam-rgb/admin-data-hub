import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { creditsApi } from "@/lib/api";

export function AddCreditDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ userId: "", amount: "", description: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount === 0) { toast.error("Enter a valid amount"); return; }
    setLoading(true);
    const ok = amount > 0
      ? await creditsApi.addCredits(form.userId, amount, form.description || undefined)
      : await creditsApi.removeCredits(form.userId, Math.abs(amount), form.description || undefined);
    setLoading(false);
    if (ok) {
      toast.success(`${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount)} credits`);
      setOpen(false);
      setForm({ userId: "", amount: "", description: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
          <CreditCard className="h-3.5 w-3.5" />
          Credits
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Credits</DialogTitle>
          <DialogDescription>Add or remove credits. Use a negative value to deduct.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID (UUID)</Label>
            <Input id="userId" value={form.userId}
              onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="e.g. 100 or -50" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description (optional)</Label>
            <Input id="desc" value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Reason for adjustment..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Apply"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
