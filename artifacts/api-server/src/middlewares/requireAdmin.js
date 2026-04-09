import { supabase } from "../lib/supabase";

const ADMIN_ROLES = ["admin", "super_admin", "settings_admin", "user_admin", "api_admin", "finance_admin"];

export async function requireAdmin(req, res, next) {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        res.status(500).json({ message: "Failed to verify admin role" });
        return;
    }
    if (!data || !ADMIN_ROLES.includes(data.role)) {
        res.status(403).json({ message: "Admin access required to perform this action" });
        return;
    }
    next();
}
