import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    res.status(401).json({ message: error?.message ?? "Invalid credentials" });
    return;
  }

  const user = data.user;

  res.json({
    token: data.session.access_token,
    user: {
      id: user.id,
      email: user.email ?? "",
      username: user.user_metadata?.["username"] ?? user.email ?? "",
      role: user.user_metadata?.["role"] ?? "admin",
      status: "active",
      verified: user.email_confirmed_at != null,
      credits: 0,
      created_at: user.created_at,
    },
  });
});

export default router;
