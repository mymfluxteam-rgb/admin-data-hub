import { supabase } from "../lib/supabase";

export async function requireAuth(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Missing or invalid Authorization header" });
        return;
    }
    const token = authHeader.slice(7);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
    req.user = { id: data.user.id, email: data.user.email };
    next();
}
