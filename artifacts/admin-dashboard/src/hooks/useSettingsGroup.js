import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
export function useSettingsGroup(group, defaults) {
    const [settings, setSettings] = useState(defaults);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/settings/${group}`);
                if (res.ok) {
                    const data = await res.json();
                    setSettings({ ...defaults, ...data });
                }
            }
            catch {
                // fall back to defaults silently
            }
            finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [group]);
    const update = useCallback((key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);
    const save = useCallback(async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/settings/${group}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err.message ?? "Failed to save settings");
                return;
            }
            toast.success("Settings saved");
        }
        catch {
            toast.error("Could not reach backend");
        }
        finally {
            setSaving(false);
        }
    }, [group, settings]);
    return { settings, setSettings, update, loading, saving, save };
}
